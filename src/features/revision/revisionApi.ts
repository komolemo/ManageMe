import { invoke } from "@tauri-apps/api/core";
import type { Revision } from "@/features/revision/types";

export const revisionApi = {
  listRecent(limit = 10) {
    return invoke<Revision[]>("list_recent_revisions", { limit });
  },
};
