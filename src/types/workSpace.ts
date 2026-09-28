import { Participant } from ".";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  boardsCount: number;
  members: Participant[];
}
