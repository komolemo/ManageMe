import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/useSettings";

export function AppSidebarToggle() {
  const { t } = useTranslation();
  const isSidebarOpen = useSettings((state) => state.isAppSidebarOpen);
  const setIsSidebarOpen = useSettings((state) => state.setIsAppSidebarOpen);
  const SidebarToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <button
      aria-label={
        isSidebarOpen
          ? t("detailSidebar.collapse")
          : t("detailSidebar.expand")
      }
      aria-expanded={isSidebarOpen}
      className="grid w-[40px] h-[40px] cursor-pointer py-2 place-items-center border-0 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
      onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
      type="button"
    >
      <SidebarToggleIcon className="size-6" />
    </button>
  );
}
