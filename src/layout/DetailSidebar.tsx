import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useDetailSidebar } from "@/layout/DetailSidebarContext";

type DetailSidebarProps = {
  children?: ReactNode;
};

export function DetailSidebar({ children }: DetailSidebarProps) {
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;

  return (
    <aside
      className={`h-full shrink-0 overflow-hidden bg-background text-foreground transition-[width] duration-200 ${
        isOpen ? "w-[256px] border-r" : "w-[0px]"
      }`}
      aria-label="Detail sidebar"
    >
      <div className="hover-scrollbar-y box-border h-full w-[256px] max-w-full overflow-y-auto px-[8px] py-[8px]">
        {children}
      </div>
    </aside>
  );
}

export function DetailSidebarToggle() {
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;
  const SidebarIcon = detailSidebar?.isOpen ? PanelLeftClose : PanelLeftOpen;

  if (!detailSidebar) {
    return null;
  }

  return (
    <div
      className={`flex h-[36px] shrink-0 justify-end transition-[width] duration-200 ${
        isOpen ? "w-[256px] border-r" : "w-[36px]"
      }`}
    >
      <Button
        aria-label={
          detailSidebar.isOpen ? "Collapse Sidebar 2" : "Expand Sidebar 2"
        }
        className={`size-8 w-[36px] items-center bg-background px-[4px] text-muted-foreground hover:bg-sidebar-foreground/10 hover:text-foreground ${
          detailSidebar.isOpen ? "border-0 bg-transparent" : "border-r"
        }`}
        onClick={detailSidebar.onToggle}
        size="icon-sm"
        type="button"
      >
        <SidebarIcon className="size-[24px] text-current" />
      </Button>
    </div>
  );
}
