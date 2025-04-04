export function getTabPrompt(tab: string) {
  switch (tab) {
    case "overview":
      return `Create a comprehensive overview of the repository. Include:
1. A clear, concise description of what the project does and its purpose
2. The main goals and objectives of the project
3. Who would use this project and why
Base your analysis on the repository content below.`;

    case "structure":
      return `Analyze the structure of the repository. Include:
1. A high-level overview of how the codebase is organized
2. Key directories and their purpose
3. Important files that new contributors should understand first
4. Any architectural patterns being used
Base your analysis on the repository content below.`;

    case "setup":
      return `Provide setup instructions for the repository. Include:
1. Required prerequisites and dependencies
2. Step-by-step installation guide
3. How to set up a development environment
4. How to run tests or verify the installation
Base your instructions on the repository content below.`;

    case "contribute":
      return `Explain how to contribute to the repository. Include:
1. Guidelines for contribution
2. Workflow for submitting changes
3. Good first issues or areas where new contributors can help
4. Best practices for this specific project
Base your explanation on the repository content below.`;

    default:
      return `Provide a general overview of the repository.`;
  }
}

export function getTabQueryKeywords(tab: string) {
  switch (tab) {
    case "overview":
      return "repository overview project description goals purpose readme";
    case "structure":
      return "repository file structure code organization directories architecture";
    case "setup":
      return "installation setup prerequisites getting started development environment";
    case "contribute":
      return "contributing guidelines contribution workflow good first issues";
    default:
      return "project overview and structure";
  }
}

export function getSystemMessageV2() {
  return {
    role: "system",
    content: `You are CodeSherpa, an AI assistant that provides help with code repositories. 
    Use the searchRepository tool to find relevant information. 
    You need to formulate a query consisting of most relevant keywords, and you will receive semantic search results of the repository in return.
    Analyze the received context carefully to provide accurate and helpful information.
    Format your response in Markdown with clear sections and bullet points where appropriate.
    Use URLs in the provided context to point to concrete issues, PRs or discussions.
    If the context doesn't provide enough information for certain aspects, acknowledge this limitation.
    `,
  };
}

export function getSystemMessage(contextText: string) {
  return `You are an AI assistant that specializes in helping developers understand GitHub repositories and onboard to new projects. 
          
REPOSITORY CONTEXT:
${contextText}

Analyze the repository context carefully to provide accurate and helpful information.
Format your response in Markdown with clear sections and bullet points where appropriate.
Use URLs in the provided context to point to concrete issues, PRs or discussions.
If the context doesn't provide enough information for certain aspects, acknowledge this limitation.`;
}
