import { ArrowLeftFromLine, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";

// ================================================================
// 詳細サイドバー開閉トグル

export function DetailSidebarToggle() {
  const { t } = useTranslation();
  const detailSidebar = useDetailSidebar();
  const SidebarIcon = detailSidebar?.isOpen ? ArrowLeftFromLine : Menu;

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
      className="text-muted-foreground hover:text-foreground rounded-lg"
      onClick={detailSidebar.onToggle}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <SidebarIcon className="size-6  text-current" />
    </Button>
  );
}
