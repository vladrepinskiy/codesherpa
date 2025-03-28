export type RepositoryStatus = "importing" | "analyzing" | "ready" | "error";

export interface Repository {
  id: string;
  github_id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  is_private: boolean;
  stars_count: number;
  last_analyzed: string | null;
  status: RepositoryStatus;
  error_message: string | null;
  current_stage: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRepository {
  id: string;
  user_id: string;
  repository_id: string;
  is_favorite: boolean;
  last_accessed: string | null;
  notes: string | null;
  created_at: string;
}

export interface RepositoryFile {
  id: string;
  repository_id: string;
  path: string;
  language: string | null;
  size_bytes: number;
  last_modified: string | null;
  chroma_collection_id: string | null;
  created_at: string;
}

export interface FileContent {
  path: string;
  content: string;
  language: string | null;
  size_bytes: number;
  last_modified: string | null;
}
