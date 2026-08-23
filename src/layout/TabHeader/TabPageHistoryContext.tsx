import { createContext, type ReactNode, useContext } from "react";

type TabPageHistoryContextValue = {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
};

const TabPageHistoryContext =
  createContext<TabPageHistoryContextValue | null>(null);

type TabPageHistoryProviderProps = TabPageHistoryContextValue & {
  children: ReactNode;
};

export function TabPageHistoryProvider({
  canGoBack,
  canGoForward,
  children,
  goBack,
  goForward,
}: TabPageHistoryProviderProps) {
  return (
    <TabPageHistoryContext.Provider
      value={{ canGoBack, canGoForward, goBack, goForward }}
    >
      {children}
    </TabPageHistoryContext.Provider>
  );
}

export function useTabPageHistory() {
  const context = useContext(TabPageHistoryContext);

  if (!context) {
    throw new Error(
      "useTabPageHistory must be used within TabPageHistoryProvider",
    );
  }

  return context;
}
