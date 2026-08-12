import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";

// ================================================================
// 詳細サイドバー開閉トグル

export function DetailSidebarToggle() {
  const { t } = useTranslation();
  const detailSidebar = useDetailSidebar();
  const SidebarIcon = detailSidebar?.isOpen ? PanelLeftClose : PanelLeftOpen;

  if (!detailSidebar) {
    return null;
  }

  return (
    <Button
      aria-label={
        detailSidebar.isOpen
          ? t("detailSidebar.collapse")
          : t("detailSidebar.expand")
      }
      className={`size-8 items-center rounded-lg bg-background px-0 text-muted-foreground hover:bg-sidebar-foreground/10 hover:text-foreground ${
        detailSidebar.isOpen ? "border-0 bg-transparent" : "border-r"
      }`}
      onClick={detailSidebar.onToggle}
      size="icon-sm"
      type="button"
    >
      <SidebarIcon className="size-6 text-current" />
    </Button>
  );
}
