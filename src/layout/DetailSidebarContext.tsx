import { createContext, useContext, type ReactNode } from "react";

export type DetailSidebarConfig = {
  addLabel?: string;
  children?: ReactNode;
  filterLabel?: string;
  onAddFile?: () => void;
  onFilterChange?: (query: string) => void;
  onOpenProject?: () => void;
};

type DetailSidebarContextValue = {
  isOpen: boolean;
  onConfigChange: (config: DetailSidebarConfig | null) => void;
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
