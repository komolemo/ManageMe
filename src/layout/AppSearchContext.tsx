import { createContext, useContext } from "react";

const AppSearchContext = createContext<((query: string) => void) | null>(null);

export const AppSearchProvider = AppSearchContext.Provider;

export function useAppSearch() {
  return useContext(AppSearchContext);
}
