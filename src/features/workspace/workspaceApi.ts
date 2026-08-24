import { invoke } from "@tauri-apps/api/core";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceType,
} from "@/features/workspace/types";

export const workspaceApi = {
  create(input: CreateWorkspaceInput) {
    return invoke<Workspace>("create_workspace", { input });
  },

  getById(workspaceId: string) {
    return invoke<Workspace | null>("get_workspace_by_id", {
      workspaceId,
    });
  },

  getByKey(workspaceKey: string) {
    return invoke<Workspace | null>("get_workspace_by_key", {
      workspaceKey,
    });
  },

  list(workspaceType: WorkspaceType) {
    return invoke<Workspace[]>("list_workspaces", { workspaceType });
  },

  update(workspaceId: string, input: UpdateWorkspaceInput) {
    return invoke<Workspace | null>("update_workspace", {
      workspaceId,
      input,
    });
  },

  toggleFavorite(workspaceId: string, isFavorite: boolean) {
    return invoke<Workspace | null>("update_workspace", {
      workspaceId,
      isFavorite,
    });
  },

  delete(workspaceId: string) {
    return invoke<boolean>("delete_workspace", { workspaceId });
  },
};
