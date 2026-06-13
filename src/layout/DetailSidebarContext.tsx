import { createContext, useContext, type ReactNode } from "react";

type DetailSidebarContextValue = {
  isOpen: boolean;
  onToggle: () => void;
};

const DetailSidebarContext = createContext<DetailSidebarContextValue | null>(
  null
);

export function DetailSidebarProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: DetailSidebarContextValue;
}) {
  return (
    <DetailSidebarContext.Provider value={value}>
      {children}
    </DetailSidebarContext.Provider>
  );
}

export function useDetailSidebar() {
  return useContext(DetailSidebarContext);
}
