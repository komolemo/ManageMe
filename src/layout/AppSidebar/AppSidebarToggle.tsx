import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function AppSidebarToggle() {
  const { t } = useTranslation();
  const isSidebarOpen = useSettings((state) => state.isAppSidebarOpen);
  const setIsSidebarOpen = useSettings((state) => state.setIsAppSidebarOpen);
  const SidebarToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <Button
      aria-label={
        isSidebarOpen
          ? t("detailSidebar.collapse")
          : t("detailSidebar.expand")
      }
      aria-expanded={isSidebarOpen}
      className="rounded-lg bg-transparent"
      size="icon-lg"
      onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
      type="button"
      variant="ghost"
    >
      <SidebarToggleIcon className="size-6" />
    </Button>
  );
}
