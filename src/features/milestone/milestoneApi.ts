import { invoke } from "@tauri-apps/api/core";
import type {
  CreateMilestoneInput,
  Milestone,
} from "@/features/milestone/types";

export const milestoneApi = {
  create(input: CreateMilestoneInput) {
    return invoke<Milestone>("create_milestone", { input });
  },

  list(workspaceId: string) {
    return invoke<Milestone[]>("list_milestones", { workspaceId });
  },

  update(milestoneId: string, name: string) {
    return invoke<Milestone | null>("update_milestone", {
      milestoneId,
      name,
    });
  },

  reorder(workspaceId: string, milestoneIds: string[]) {
    return invoke<Milestone[]>("reorder_milestones", {
      workspaceId,
      milestoneIds,
    });
  },

  delete(milestoneId: string) {
    return invoke<boolean>("delete_milestone", { milestoneId });
  },
};
