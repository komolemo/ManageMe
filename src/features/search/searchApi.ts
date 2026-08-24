import { invoke } from "@tauri-apps/api/core";

import type { SearchResultItem } from "@/features/search/types";

export const searchApi = {
  search(query: string, limit = 100) {
    return invoke<SearchResultItem[]>("search_all", { query, limit });
  },
};
