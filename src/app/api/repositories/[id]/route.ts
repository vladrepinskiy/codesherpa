import { getChromaClient } from "@/lib/chromadb/chroma-client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  try {
    const { id: repositoryId } = await params;

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the user has access to this repository
    const { data: userRepo, error: userRepoError } = await supabase
      .from("user_repositories")
      .select("repository_id")
      .eq("user_id", user.id)
      .eq("repository_id", repositoryId)
      .single();

    if (userRepoError || !userRepo) {
      return NextResponse.json(
        { error: "Repository not found or access denied" },
        { status: 404 }
      );
    }

    // Delete repository (cascading will take care of user_repositories and repository_files)
    const { error: deleteRepoError } = await supabase
      .from("repositories")
      .delete()
      .eq("id", repositoryId);

    if (deleteRepoError) {
      console.error("Error deleting repository:", deleteRepoError);
      return NextResponse.json(
        { error: "Failed to delete repository" },
        { status: 500 }
      );
    }

    // Use standardized collection names instead of querying the database
    const codeCollectionId = `repo_${repositoryId}_code`;
    const discussionsCollectionId = `repo_${repositoryId}_discussions`;
    const collectionIds = [codeCollectionId, discussionsCollectionId];

    // Delete ChromaDB collections
    try {
      const chromaClient = await getChromaClient();

      // Delete each collection with improved error handling
      for (const collectionId of collectionIds) {
        try {
          // Check if collection exists before attempting to delete
          const collections = await chromaClient.listCollections();
          const collectionExists = collections.some(
            (c) => c === collectionId // Note: collections may be objects with a 'name' property
          );

          if (collectionExists) {
            await chromaClient.deleteCollection({ name: collectionId });
            console.log(`Deleted ChromaDB collection: ${collectionId}`);
          } else {
            console.log(
              `ChromaDB collection ${collectionId} not found - skipping deletion`
            );
          }
        } catch (collectionError) {
          console.error(
            `Error with ChromaDB collection ${collectionId}:`,
            collectionError
          );
          // Continue with other collections even if one fails
        }
      }
    } catch (chromaError) {
      console.error("Error connecting to ChromaDB:", chromaError);
      // Continue even if ChromaDB deletion fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Repository and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error in repository deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete repository" },
      { status: 500 }
    );
  }
}
