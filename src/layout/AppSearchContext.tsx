import { createContext, useContext } from "react";

type AppSearchContextValue = {
  onOpenSearchDocument: (documentId: string) => void;
  onOpenSearchTask: (taskId: string) => void;
  onSearch: (query: string) => void;
  showSearchSuggestions: boolean;
};

const AppSearchContext = createContext<AppSearchContextValue | null>(null);

export const AppSearchProvider = AppSearchContext.Provider;

export function useAppSearch() {
  return useContext(AppSearchContext);
}
