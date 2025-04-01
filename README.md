# CodeSherpa

### AI-Powered GitHub Repository Onboarding Assistant

CodeSherpa is a prototype tool, that should help developers quickly understand and navigate unfamiliar github codebases. By leveraging large language models and semantic search, it provides personalized guidance and answers questions about repository structure, code patterns, and development history.

### Features:

- Repository Analysis: Import GitHub repositories and analyze code, commits, issues, and documentation
- AI Chat Interface: Ask natural language questions about the codebase and receive contextual answers
- Intelligent Code Exploration: Understand code structure, dependencies, and architectural patterns
- Onboarding Path Generation: Receive customized "getting started" recommendations and paths through the codebase

### Tech Stack:

- Frontend: Next.js 14, React, Tailwind CSS, shadcn/ui for some complex components
- Vector Search: ChromaDB for vector stores and semantic code search
- AI/LLM: OpenAI API for intelligent responses
- Embedding: Sentence Transformers for code embedding
- Authentication: Supabase Auth
- Bringing it together: Docker + Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Supabase account (for authentication)
- OpenAI API key

### Installation

Clone the repository:

```shell
    git clone https://github.com/yourusername/code-sherpa.git
    cd code-sherpa
```

Create a .env file using the env.example (run `cp .env.example .env`), and add your API keys to the .env file:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_URL=http://chromadb:8000
CHROMA_RESULTS_NUMBER=5
```

Start the application:

```shell
docker-compose up
```

Open your browser and navigate to http://localhost:3000

### Usage

**Import a Repository**: Enter a GitHub repository URL to import and analyze.
**Explore the Codebase**: Navigate through the repository structure and see key files.
**Ask Questions**: Use the AI chat interface to ask about any aspect of the code.
**Get Onboarding Guidance**: Receive personalized recommendations on where to start.

Some example questions:

- "How does authentication work in this app?"
- "What's the overall architecture of this project?"
- "Explain the component structure of the frontend"
- "Where should I start if I want to understand the data flow?"

## Development

This project uses Node.js/npm for package management and Docker for development:

### Start the development environment

```bash
npm run docker:up
```

### Install a new package

```bash
npm install package-name
```

### Add a shadcn/ui component

```bash
npx shadcn-ui@latest add button
```

### Stop the development environment

```bash
npm run docker:down
```

## Important Technical Notes

**Node.js vs Bun**: While this project was originally developed with Bun, I've switched to Node.js due to compatibility issues between Bun and Next.js server actions in Docker environments. When using Bun, server actions would freeze without completing or returning errors, making authentication and other features unusable. Good old Node.js resolves this issue and provides better stability in the Docker environment.
