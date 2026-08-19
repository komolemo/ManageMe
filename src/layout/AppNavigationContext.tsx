import { createContext, useContext, type ReactNode } from "react";

import type { PageKey } from "@/pages/pageTypes";

type AppNavigationContextValue = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

const AppNavigationContext = createContext<AppNavigationContextValue | null>(
  null,
);

export function AppNavigationProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AppNavigationContextValue;
}) {
  return (
    <AppNavigationContext.Provider value={value}>
      {children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigationContext() {
  return useContext(AppNavigationContext);
}
