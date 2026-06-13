import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDetailSidebar } from "@/layout/DetailSidebarContext";

type DetailSidebarProps = {
  isOpen: boolean;
};

export function DetailSidebar({
  isOpen,
}: DetailSidebarProps) {
  return (
    <aside
      className={`h-full shrink-0 overflow-hidden bg-background text-foreground transition-[width] duration-200 ${
        isOpen ? "w-[200px] border-r" : "w-[36px]"
      }`}
      aria-label="Detail sidebar"
    >
      <div className="flex h-[36px] items-start justify-end">
        <DetailSidebarToggleButton />
      </div>
    </aside>
  );
}

function DetailSidebarToggleButton() {
  const detailSidebar = useDetailSidebar();
  const SidebarIcon = detailSidebar?.isOpen ? PanelLeftClose : PanelLeftOpen;

  if (!detailSidebar) {
    return null;
  }

  return (
    <Button
      aria-label={
        detailSidebar.isOpen ? "Collapse Sidebar 2" : "Expand Sidebar 2"
      }
      className={`size-8 w-[36px] bg-background px-[4px] py-[8px] text-foreground hover:bg-muted hover:text-foreground ${
        detailSidebar.isOpen ? "border-0 bg-transparent" : "border-r rounded-r-md"
      }`}
      onClick={detailSidebar.onToggle}
      size="icon-sm"
      type="button"
    >
      <SidebarIcon className="size-[24px] text-current" />
    </Button>
  );
}
