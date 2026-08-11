import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ResizeHandle } from "@/components/app/ResizeHandle";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";
import { useTranslation } from "react-i18next";

type DetailSidebarProps = {
  children?: ReactNode;
  header?: ReactNode;
};

const MIN_DETAIL_SIDEBAR_WIDTH = 200;
const MAX_DETAIL_SIDEBAR_WIDTH = 480;
const DEFAULT_DETAIL_SIDEBAR_WIDTH = 256;

export function DetailSidebar({
  children,
  header,
}: DetailSidebarProps) {
  const { t } = useTranslation();
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;
  const [sidebarWidth, setSidebarWidth] = useState(
    DEFAULT_DETAIL_SIDEBAR_WIDTH,
  );

  const resizeSidebar = (deltaX: number) => {
    const maxWidth = Math.max(
      MIN_DETAIL_SIDEBAR_WIDTH,
      Math.min(MAX_DETAIL_SIDEBAR_WIDTH, window.innerWidth - 160),
    );

    setSidebarWidth((currentWidth) =>
      Math.min(
        Math.max(currentWidth + deltaX, MIN_DETAIL_SIDEBAR_WIDTH),
        maxWidth,
      ),
    );
  };

  return (
    <aside
      aria-label={t("detailSidebar.label")}
      className="flex h-full shrink-0 overflow-hidden bg-transparent"
      style={{ width: isOpen ? `${sidebarWidth}px` : "0px" }}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col pl-2 pr-1 py-[8px] rounded-md bg-sidebar text-muted-foreground">
        {header}
        <div className="hover-scrollbar-y min-h-0 w-full flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <ResizeHandle
        aria-label={t("detailSidebar.resize")}
        aria-valuemax={MAX_DETAIL_SIDEBAR_WIDTH}
        aria-valuemin={MIN_DETAIL_SIDEBAR_WIDTH}
        aria-valuenow={sidebarWidth}
        onResize={resizeSidebar}
        tabIndex={isOpen ? 0 : -1}
      />
    </aside>
  );
}

export function DetailSidebarToggle() {
  const { t } = useTranslation();
  const detailSidebar = useDetailSidebar();
  const SidebarIcon = detailSidebar?.isOpen ? PanelLeftClose : PanelLeftOpen;

  if (!detailSidebar) {
    return null;
  }

  return (
    <div
      className="flex shrink-0 justify-center"
    >
      <Button
        aria-label={
          detailSidebar.isOpen ? t("detailSidebar.collapse") : t("detailSidebar.expand")
        }
        className={`size-8 rounded-lg items-center bg-background px-0 text-muted-foreground hover:bg-sidebar-foreground/10 hover:text-foreground ${
          detailSidebar.isOpen ? "border-0 bg-transparent" : "border-r"
        }`}
        onClick={detailSidebar.onToggle}
        size="icon-sm"
        type="button"
      >
        <SidebarIcon className="size-6 text-current" />
      </Button>
    </div>
  );
}
