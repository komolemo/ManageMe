import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { DetailSidebar } from "@/layout/DetailSidebar/DetailSidebar";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";
import { DetailSidebarToggle } from "@/layout/DetailSidebar/DetailSidebarToggle";

type PageDetailSidebarProps = {
  children?: ReactNode;
  header?: ReactNode;
  toolbar?: ReactNode;
};

export function PageDetailSidebar({
  children,
  header,
  toolbar,
}: PageDetailSidebarProps) {
  const detailSidebarContext = useDetailSidebar();

  if (!children) {
    return null;
  }

  return (
    <div
      className={cn(
       "px-2 pb-2",
       detailSidebarContext?.isOpen ? "min-w-[200px]" : "min-w-0"
      )}
    >
      {detailSidebarContext?.isOpen ? (
        <DetailSidebar header={header} toolbar={toolbar}>
          {children}
        </DetailSidebar>
      ) : (
        <div className="flex h-10 items-center">
          <DetailSidebarToggle />
        </div>
      )}
    </div>
  );
}
