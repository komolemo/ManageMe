import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDetailSidebar } from "@/layout/DetailSidebarContext";
export function DetailSidebar() {
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;

  return (
    <aside
      className={`h-full shrink-0 overflow-hidden bg-background text-foreground transition-[width] duration-200 ${
        isOpen ? "w-[200px] border-r" : "w-[0px]"
      }`}
      aria-label="Detail sidebar"
    />
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
      className={`flex h-[29px] py-[4px] shrink-0 justify-end transition-[width] duration-200 ${
        isOpen ? "w-[200px] border-r" : "w-[36px]"
      }`}
    >
      <Button
        aria-label={
          detailSidebar.isOpen ? "Collapse Sidebar 2" : "Expand Sidebar 2"
        }
        className={`size-8 w-[36px] bg-background px-[4px] py-[2px] text-foreground hover:bg-muted hover:text-foreground ${
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
