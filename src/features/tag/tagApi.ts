import { invoke } from "@tauri-apps/api/core";
import type {
  CreateTagInput,
  Tag,
  UpdateTagInput,
} from "@/features/tag/types";

export const tagApi = {
  create(input: CreateTagInput) {
    return invoke<Tag>("create_tag", { input });
  },

  getById(tagId: string) {
    return invoke<Tag | null>("get_tag_by_id", { tagId });
  },

  list() {
    return invoke<Tag[]>("list_tags");
  },

  search(query: string, limit = 5) {
    return invoke<Tag[]>("search_tags", { query, limit });
  },

  update(tagId: string, input: UpdateTagInput) {
    return invoke<Tag | null>("update_tag", { tagId, input });
  },

  touchLastUsed(tagId: string) {
    return invoke<Tag | null>("touch_tag_last_used", { tagId });
  },
};
