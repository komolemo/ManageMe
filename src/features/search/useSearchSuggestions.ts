import { useEffect, useState } from "react";

import { searchLogApi } from "@/features/search/searchLogApi";
import type { SearchSuggestion } from "@/features/search/types";

const suggestionDelayMs = 150;

export function useSearchSuggestions(query: string, workspaceId?: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setSuggestions([]);
      return;
    }

    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      void searchLogApi
        .listSuggestions(normalizedQuery, workspaceId)
        .then((items) => {
          if (isCurrent) {
            setSuggestions(items);
          }
        })
        .catch(() => {
          if (isCurrent) {
            setSuggestions([]);
          }
        });
    }, suggestionDelayMs);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, workspaceId]);

  return suggestions;
}
