export type WorkspaceType = 0 | 1;

export const WORKSPACE_TYPE = {
  PROJECT: 0,
  LIBRARY: 1,
} as const satisfies Record<string, WorkspaceType>;

export type Workspace = {
  workspaceId: string;
  workspaceKey: string;
  workspaceType: WorkspaceType;
  name: string;
  description: string;
  iconId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceInput = Pick<
  Workspace,
  | "workspaceId"
  | "workspaceKey"
  | "workspaceType"
  | "name"
  | "description"
  | "iconId"
>;

export type UpdateWorkspaceInput = Pick<
  Workspace,
  "name" | "description" | "iconId" | "isFavorite"
>;
