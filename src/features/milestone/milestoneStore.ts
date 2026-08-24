import { create } from "zustand";
import { milestoneApi } from "@/features/milestone/milestoneApi";
import type {
  CreateMilestoneInput,
  Milestone,
} from "@/features/milestone/types";

type MilestoneStore = {
  error: string | null;
  loadingWorkspaceId: string | null;
  milestones: Milestone[];
  createMilestone: (input: CreateMilestoneInput) => Promise<Milestone>;
  deleteMilestone: (milestoneId: string) => Promise<boolean>;
  loadMilestones: (workspaceId: string) => Promise<void>;
  reorderMilestones: (
    workspaceId: string,
    milestoneIds: string[],
  ) => Promise<Milestone[]>;
  updateMilestone: (
    milestoneId: string,
    name: string,
  ) => Promise<Milestone | null>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const useMilestoneStore = create<MilestoneStore>((set) => ({
  error: null,
  loadingWorkspaceId: null,
  milestones: [],

  loadMilestones: async (workspaceId) => {
    set({ error: null, loadingWorkspaceId: workspaceId, milestones: [] });
    try {
      const milestones = await milestoneApi.list(workspaceId);
      set({ milestones });
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    } finally {
      set({ loadingWorkspaceId: null });
    }
  },

  createMilestone: async (input) => {
    set({ error: null });
    try {
      const milestone = await milestoneApi.create(input);
      set((state) => ({ milestones: [...state.milestones, milestone] }));
      return milestone;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateMilestone: async (milestoneId, name) => {
    set({ error: null });
    try {
      const milestone = await milestoneApi.update(milestoneId, name);
      if (milestone) {
        set((state) => ({
          milestones: state.milestones.map((item) =>
            item.milestoneId === milestoneId ? milestone : item
          ),
        }));
      }
      return milestone;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  reorderMilestones: async (workspaceId, milestoneIds) => {
    set({ error: null });
    try {
      const milestones = await milestoneApi.reorder(
        workspaceId,
        milestoneIds,
      );
      set({ milestones });
      return milestones;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  deleteMilestone: async (milestoneId) => {
    set({ error: null });
    try {
      const deleted = await milestoneApi.delete(milestoneId);
      if (deleted) {
        set((state) => ({
          milestones: state.milestones.filter(
            (item) => item.milestoneId !== milestoneId,
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
