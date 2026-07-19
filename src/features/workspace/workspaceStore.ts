import { create } from "zustand";
import { workspaceApi } from "@/features/workspace/workspaceApi";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceType,
} from "@/features/workspace/types";

type WorkspaceStore = {
  error: string | null;
  loadingTypes: Partial<Record<WorkspaceType, boolean>>;
  loadedTypes: Partial<Record<WorkspaceType, boolean>>;
  workspaces: Workspace[];
  clearError: () => void;
  createWorkspace: (input: CreateWorkspaceInput) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  loadWorkspaces: (
    workspaceType: WorkspaceType,
    force?: boolean,
  ) => Promise<void>;
  toggleFavorite: (workspaceId: string) => Promise<Workspace | null>;
  updateWorkspace: (
    workspaceId: string,
    input: UpdateWorkspaceInput,
  ) => Promise<Workspace | null>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  error: null,
  loadingTypes: {},
  loadedTypes: {},
  workspaces: [],

  clearError: () => set({ error: null }),

  loadWorkspaces: async (workspaceType, force = false) => {
    const state = get();
    if (
      state.loadingTypes[workspaceType] ||
      (!force && state.loadedTypes[workspaceType])
    ) {
      return;
    }

    set((current) => ({
      error: null,
      loadingTypes: { ...current.loadingTypes, [workspaceType]: true },
    }));
    try {
      const workspaces = await workspaceApi.list(workspaceType);
      set((current) => ({
        loadedTypes: { ...current.loadedTypes, [workspaceType]: true },
        workspaces: [
          ...current.workspaces.filter(
            (workspace) => workspace.workspaceType !== workspaceType,
          ),
          ...workspaces,
        ],
      }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    } finally {
      set((current) => ({
        loadingTypes: { ...current.loadingTypes, [workspaceType]: false },
      }));
    }
  },

  createWorkspace: async (input) => {
    set({ error: null });
    try {
      const workspace = await workspaceApi.create(input);
      set((current) => ({
        workspaces: [...current.workspaces, workspace],
      }));
      return workspace;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateWorkspace: async (workspaceId, input) => {
    set({ error: null });
    try {
      const workspace = await workspaceApi.update(workspaceId, input);
      if (workspace) {
        set((current) => ({
          workspaces: current.workspaces.map((entry) =>
            entry.workspaceId === workspaceId ? workspace : entry,
          ),
        }));
      }
      return workspace;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  toggleFavorite: async (workspaceId) => {
    const currentWorkspace = get().workspaces.find(
      (workspace) => workspace.workspaceId === workspaceId,
    );
    if (!currentWorkspace) {
      return null;
    }

    set({ error: null });
    try {
      const workspace = await workspaceApi.toggleFavorite(
        workspaceId,
        !currentWorkspace.isFavorite,
      );
      if (workspace) {
        set((current) => ({
          workspaces: current.workspaces.map((entry) =>
            entry.workspaceId === workspaceId ? workspace : entry,
          ),
        }));
      }
      return workspace;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  deleteWorkspace: async (workspaceId) => {
    set({ error: null });
    try {
      const deleted = await workspaceApi.delete(workspaceId);
      if (deleted) {
        set((current) => ({
          workspaces: current.workspaces.filter(
            (workspace) => workspace.workspaceId !== workspaceId,
          ),
        }));
      }
      return deleted;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },
}));
