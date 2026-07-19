import { FilePlusCorner, Kanban, ListFilter, ListPlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDetailSidebar } from "@/layout/DetailSidebarContext";
import { useTranslation } from "react-i18next";

type DetailSidebarProps = {
  addLabel?: string;
  children?: ReactNode;
  filterLabel?: string;
  onAddFile?: () => void;
  onFilterChange?: (query: string) => void;
  onOpenProject?: () => void;
};

export function DetailSidebar({
  addLabel,
  children,
  filterLabel,
  onAddFile,
  onFilterChange,
  onOpenProject,
}: DetailSidebarProps) {
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t("detailSidebar.addDocument");
  const resolvedFilterLabel = filterLabel ?? t("detailSidebar.filterDocuments");
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <aside
      className={`h-full shrink-0 rounded-md overflow-hidden bg-background text-foreground  ${
        isOpen ? "w-[256px]" : "w-[0px]"
      }`}
      aria-label={t("detailSidebar.label")}
    >
      <div className="flex h-[36px] w-[256px] items-center justify-between gap-1 px-[8px]">
        {onOpenProject ? (
          <Button
            aria-label={t("detailSidebar.openProject")}
            className="h-7 gap-1 rounded-sm border-0 px-2"
            onClick={onOpenProject}
            type="button"
            variant="ghost"
          >
            <Kanban aria-hidden className="size-4" />
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
        <Button
          aria-label={resolvedFilterLabel}
          aria-pressed={isFilterOpen}
          className="size-7 rounded-sm border-0"
          onClick={() => {
            setIsFilterOpen((isOpen) => {
              if (isOpen) {
                onFilterChange?.("");
              }
              return !isOpen;
            });
          }}
          size="icon-sm"
          type="button"
          variant={isFilterOpen ? "secondary" : "ghost"}
        >
          <ListFilter aria-hidden className="size-4" />
        </Button>
        <Button
          aria-label={resolvedAddLabel}
          className="size-7 rounded-sm border-0"
          disabled={!onAddFile}
          onClick={onAddFile}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ListPlus aria-hidden className="size-4" />
        </Button>
        <Button
          aria-label={resolvedAddLabel}
          className="size-7 rounded-sm border-0"
          disabled={!onAddFile}
          onClick={onAddFile}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <FilePlusCorner aria-hidden className="size-4" />
        </Button>
        </div>
      </div>
      {isFilterOpen ? (
        <div className="w-[256px] border-b px-[8px] py-[6px]">
          <Input
            aria-label={resolvedFilterLabel}
            autoFocus
            className="h-7 rounded-md"
            onChange={(event) => onFilterChange?.(event.target.value)}
            placeholder={`${resolvedFilterLabel}...`}
          />
        </div>
      ) : null}
      <div className="hover-scrollbar-y box-border w-[256px] max-w-full overflow-y-auto px-[8px] py-[8px]" style={{ height: isFilterOpen ? "calc(100% - 77px)" : "calc(100% - 36px)" }}>
        {children}
      </div>
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
