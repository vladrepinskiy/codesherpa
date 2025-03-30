import { createClient } from "@/lib/supabase/server";
import { getOrCreateCollection } from "@/lib/chromadb/chroma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: repositoryId } = params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRepo } = await supabase
      .from("user_repositories")
      .select("*")
      .eq("user_id", user.id)
      .eq("repository_id", repositoryId)
      .single();

    if (!userRepo) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    const codeCollectionId = `repo_${repositoryId}_code`;
    const discussionsCollectionId = `repo_${repositoryId}_discussions`;

    const { count: filesCount, error: filesError } = await supabase
      .from("repository_files")
      .select("*", { count: "exact", head: true })
      .eq("repository_id", repositoryId);

    const { count: discussionsCount, error: discussionsError } = await supabase
      .from("repository_discussions")
      .select("*", { count: "exact", head: true })
      .eq("repository_id", repositoryId);

    if (filesError || discussionsError) {
      return NextResponse.json(
        {
          error: "Error fetching data from Supabase",
          filesError,
          discussionsError,
        },
        { status: 500 }
      );
    }

    let codeCollection;
    let discussionsCollection;
    let codeChromaCount = 0;
    let discussionsChromaCount = 0;
    let codeCollectionExists = false;
    let discussionsCollectionExists = false;
    let uniqueCodeFilesInChroma = 0;
    let uniqueDiscussionsInChroma = 0;

    try {
      codeCollection = await getOrCreateCollection(codeCollectionId);
      if (codeCollection) {
        codeCollectionExists = true;
        codeChromaCount = await codeCollection.count();

        const queryResult = await codeCollection.get({
          // @ts-expect-error - "metadatas" is a valid value according to IncludeEnum
          include: ["metadatas"],
        });

        // Extract file paths and count unique ones
        const uniqueFilePaths = new Set<string>();
        if (queryResult.metadatas && queryResult.metadatas.length > 0) {
          for (const metadata of queryResult.metadatas) {
            if (
              metadata &&
              "path" in metadata &&
              typeof metadata.path === "string"
            ) {
              uniqueFilePaths.add(metadata.path);
            }
          }
        }
        uniqueCodeFilesInChroma = uniqueFilePaths.size;
      }
    } catch (error) {
      console.log(`Code collection ${codeCollectionId} not found: ${error}`);
    }

    try {
      discussionsCollection = await getOrCreateCollection(
        discussionsCollectionId
      );
      if (discussionsCollection) {
        discussionsCollectionExists = true;
        discussionsChromaCount = await discussionsCollection.count();

        const queryResult = await discussionsCollection.get({
          // @ts-expect-error - "metadatas" is a valid value according to IncludeEnum
          include: ["metadatas"],
        });

        // Extract discussion paths and count unique ones
        const uniqueDiscussionPaths = new Set<string>();
        if (queryResult.metadatas && queryResult.metadatas.length > 0) {
          for (const metadata of queryResult.metadatas) {
            if (
              metadata &&
              "path" in metadata &&
              typeof metadata.path === "string"
            ) {
              uniqueDiscussionPaths.add(metadata.path);
            }
          }
        }
        uniqueDiscussionsInChroma = uniqueDiscussionPaths.size;
      }
    } catch (error) {
      console.log(
        `Discussions collection ${discussionsCollectionId} not found: ${error}`
      );
    }

    const codeIntegrity = {
      supabaseCount: filesCount || 0,
      chromaCount: codeChromaCount,
      uniqueChromaCount: uniqueCodeFilesInChroma,
      collectionExists: codeCollectionExists,
      isIntact:
        codeCollectionExists && (filesCount || 0) === uniqueCodeFilesInChroma,
    };

    const discussionsIntegrity = {
      supabaseCount: discussionsCount || 0,
      chromaCount: discussionsChromaCount,
      uniqueChromaCount: uniqueDiscussionsInChroma,
      collectionExists: discussionsCollectionExists,
      isIntact:
        discussionsCollectionExists &&
        (discussionsCount || 0) === uniqueDiscussionsInChroma,
    };

    return NextResponse.json({
      repositoryId,
      code: codeIntegrity,
      discussions: discussionsIntegrity,
      overallIntegrity: codeIntegrity.isIntact && discussionsIntegrity.isIntact,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying data integrity:", error);
    return NextResponse.json(
      { error: "Failed to verify data integrity", details: String(error) },
      { status: 500 }
    );
  }
}
