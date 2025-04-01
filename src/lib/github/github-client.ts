import { createClient } from "@/lib/supabase/server";
import { Repository } from "@/types/repository";
import { Octokit } from "@octokit/rest";
import { writeFile } from "fs/promises"; // Import fs/promises properly at the top

// Add this new function to create an Octokit instance with the provided token
export function getOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export async function getGitHubAccessToken() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session found");
    }
    const providerToken = session.provider_token;
    if (!providerToken) {
      console.warn("GitHub token not found or expired - session needs refresh");
      // Return a specific error - token expired
      throw new Error("GITHUB_TOKEN_EXPIRED");
    }
    console.log("Successfully retrieved GitHub token");
    console.log(`Token preview: ${providerToken.substring(0, 10)}...`);
    return providerToken;
  } catch (error) {
    console.error("Error getting GitHub token:", error);
    throw error;
  }
}

/**
 * Extract GitHub repository metadata using Octokit
 */
export async function getRepositoryMetadata(
  repoUrl: string,
  accessToken: string
): Promise<Partial<Repository>> {
  const octokit = getOctokit(accessToken);

  // Parse the owner and repo from URL
  // Format: https://github.com/owner/repo
  const urlParts = new URL(repoUrl).pathname.split("/").filter(Boolean);
  const owner = urlParts[0];
  const repo = urlParts[1];

  const { data } = await octokit.repos.get({ owner, repo });

  return {
    github_id: data.id,
    owner: data.owner.login,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    default_branch: data.default_branch,
    is_private: data.private,
    stars_count: data.stargazers_count,
  };
}

/**
 * Download GitHub repository as ZIP archive
 */
export async function downloadRepositoryZip(
  owner: string,
  repo: string,
  accessToken: string,
  outputPath: string
): Promise<void> {
  const octokit = getOctokit(accessToken);

  try {
    const response = await octokit.rest.repos.downloadZipballArchive({
      owner,
      repo,
      ref: "HEAD",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await writeFile(outputPath, Buffer.from(response.data as any));
    console.log(`Repository zip downloaded to ${outputPath}`);
  } catch (error) {
    console.error("Error downloading repository zip:", error);
    throw new Error(`Failed to download repository: ${error}`);
  }
}

/**
 * Fetch discussions, PRs and issues from GitHub repository
 */
export async function fetchRepositoryDiscussions(
  owner: string,
  repo: string,
  accessToken: string
): Promise<
  {
    id: string;
    title: string;
    body: string;
    url: string;
    author: string;
    createdAt: string;
    type: "issue" | "pr" | "discussion";
    number: number;
  }[]
> {
  const octokit = getOctokit(accessToken);
  const discussions = [];

  // Fetch issues
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 100,
  });

  for (const issue of issues) {
    // Skip PRs (they appear in issues list but we'll get them separately)
    if (issue.pull_request) continue;

    discussions.push({
      id: `issue_${issue.id}`,
      title: issue.title,
      body: issue.body || "",
      url: issue.html_url,
      author: issue.user?.login || "unknown",
      createdAt: issue.created_at,
      type: "issue" as const,
      number: issue.number,
    });
  }

  // Fetch PRs
  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "all",
    per_page: 100,
  });

  for (const pr of prs) {
    discussions.push({
      id: `pr_${pr.id}`,
      title: pr.title,
      body: pr.body || "",
      url: pr.html_url,
      author: pr.user?.login || "unknown",
      createdAt: pr.created_at,
      type: "pr" as const,
      number: pr.number,
    });
  }

  // Fetch discussions if the repo has GitHub Discussions enabled
  try {
    // Note: This uses the GraphQL API since REST API doesn't have discussions endpoint
    const result = await octokit.graphql(
      `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          discussions(first: 100) {
            nodes {
              id
              title
              body
              url
              author {
                login
              }
              createdAt
              number
            }
          }
        }
      }
    `,
      {
        owner,
        name: repo,
      }
    );

    // @ts-expect-error - 'result' is of type 'unknown'
    const repoDiscussions = result.repository.discussions.nodes;

    for (const discussion of repoDiscussions) {
      discussions.push({
        id: `discussion_${discussion.id}`,
        title: discussion.title,
        body: discussion.body,
        url: discussion.url,
        author: discussion.author?.login || "unknown",
        createdAt: discussion.createdAt,
        type: "discussion" as const,
        number: discussion.number,
      });
    }
  } catch (error) {
    console.log("Repository might not have discussions enabled:", error);
  }

  return discussions;
}
