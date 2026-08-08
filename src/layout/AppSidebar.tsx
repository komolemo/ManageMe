import {
  BookA,
  ChevronDown,
  ChevronRight,
  CircleDot,
  KanbanSquare,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ArrowRight
} from "lucide-react";
import { useEffect, type MouseEvent, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/useSettings";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/features/workspace/workspaceStore";
import {
  WORKSPACE_TYPE,
  type Workspace,
  type WorkspaceType,
} from "@/features/workspace/types";

type AppSidebarProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onOpenDocument: (documentTitle: string) => void;
  onOpenDocumentInNewTab: (documentTitle: string) => void;
};

const favoriteWorkspaceLimit = 5;

function favoriteWorkspaceNames(
  workspaces: Workspace[],
  workspaceType: WorkspaceType,
) {
  return workspaces
    .filter(
      (workspace) =>
        (workspace.workspaceType === workspaceType) && workspace.isFavorite,
    )
    .sort(
      (first, second) =>
        Date.parse(second.updatedAt) - Date.parse(first.updatedAt),
    )
    .slice(0, favoriteWorkspaceLimit)
    .map((workspace) => workspace.name);
}

export function AppSidebar({
  onNavigate,
  onOpenInNewTab,
  onOpenDocument,
  onOpenDocumentInNewTab,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const projectItems = favoriteWorkspaceNames(workspaces, WORKSPACE_TYPE.PROJECT);
  const documentItems = favoriteWorkspaceNames(workspaces, WORKSPACE_TYPE.LIBRARY);

  useEffect(() => {
    void Promise.all([
      loadWorkspaces(WORKSPACE_TYPE.PROJECT),
      loadWorkspaces(WORKSPACE_TYPE.LIBRARY),
    ]).catch(() => undefined);
  }, [loadWorkspaces]);
  const isSidebarOpen = useSettings((state) => state.isAppSidebarOpen);
  const setIsSidebarOpen = useSettings((state) => state.setIsAppSidebarOpen);
  const isProjectListOpen = useSettings((state) => state.isProjectListOpen);
  const setIsProjectListOpen = useSettings((state) => state.setIsProjectListOpen);
  const isLibraryOpen = useSettings((state) => state.isLibraryOpen);
  const setIsLibraryOpen = useSettings((state) => state.setIsLibraryOpen);
  const SidebarToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const openPageWithMouseWheel = (
    event: MouseEvent<HTMLElement>,
    page: PageKey
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab(page);
  };

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-0 bg-header text-sidebar-foreground ${
        isSidebarOpen ? "w-[180px]" : "w-[56px]"
      }`}
      aria-label={t("a11y.primarySidebar")}
    >
      <div
        className={`flex h-full min-h-0 flex-col gap-2 ${
          isSidebarOpen ? "w-[180px]" : "w-[56px]"
        }`}
      >
        <div
          className={`flex w-full shrink-0 ${
            isSidebarOpen ? "justify-end" : "justify-center"
          }`}
        >
          <button
            aria-label={isSidebarOpen ? t("detailSidebar.collapse") : t("detailSidebar.expand")}
            aria-expanded={isSidebarOpen}
            className="grid w-[40px] h-[40px] cursor-pointer py-2 place-items-center border-0 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            type="button"
          >
            <SidebarToggleIcon className="size-6" />
          </button>
        </div>

        {isSidebarOpen ? (
          <div className="hover-scrollbar-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-[12px]">
            <button
              className="mx-2 my-[7px] px-2 flex w-[152px] h-[40px] cursor-pointer items-center justify-start gap-2 rounded-lg border-0 bg-transparent text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("search")}
              onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
              type="button"
            >
              <Search className="size-6" />
              {t("sidebar.search")}
            </button>

            <Separator />

            <SidebarGroup
              title={t("sidebar.projects")}
              items={projectItems}
              icon={<CircleDot className="size-6 text-current" />}
              isOpen={isProjectListOpen}
              menuLabel={t("sidebar.projectList")}
              onMenuNavigate={() => onNavigate("projects")}
              onMenuOpenInNewTab={() => onOpenInNewTab("projects")}
              onItemClick={() => onNavigate("project")}
              onItemOpenInNewTab={() => onOpenInNewTab("project")}
              onToggle={() => setIsProjectListOpen((isOpen) => !isOpen)}
            />

            <Separator />

            <SidebarGroup
              title={t("sidebar.library")}
              items={documentItems}
              icon={<Library className="size-6 text-current" />}
              isOpen={isLibraryOpen}
              menuLabel={t("sidebar.libraryList")}
              onMenuNavigate={() => onNavigate("library")}
              onMenuOpenInNewTab={() => onOpenInNewTab("library")}
              onItemClick={onOpenDocument}
              onItemOpenInNewTab={onOpenDocumentInNewTab}
              onToggle={() => setIsLibraryOpen((isOpen) => !isOpen)}
            />

            <Separator />

            <button
              className="mx-2 my-[7px] flex h-[40px] w-[152px] cursor-pointer items-center justify-start gap-2 rounded-lg border-0 bg-transparent px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("dictionary")}
              onAuxClick={(event) =>
                openPageWithMouseWheel(event, "dictionary")
              }
              type="button"
            >
              <BookA className="size-6 text-current" />
              {t("sidebar.dictionary")}
            </button>
          </div>
        ) : (
          <div className="hover-scrollbar-y grid min-h-0 flex-1 content-start justify-center gap-2 overflow-x-hidden overflow-y-auto px-[2px] pt-[10px]">
            <Button
              aria-label={t("sidebar.search")}
              className="border-t w-[52px] h-[52px] gap-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("search")}
              onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
              size="icon"
              type="button"
            >
              <Search className="size-6" />
              <span className="text-[10px]">{t("sidebar.search")}</span>
            </Button>
            <Button
              aria-label={t("sidebar.projects")}
              className="border-t w-[52px] h-[52px] gap-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("projects")}
              onAuxClick={(event) => openPageWithMouseWheel(event, "projects")}
              size="icon"
              type="button"
            >
              <KanbanSquare className="size-6 text-current" />
              <span className="text-[10px]">{t("sidebar.projects")}</span>
            </Button>
            <Button
              aria-label={t("sidebar.document")}
              className="border-t w-[52px] h-[52px] gap-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("library")}
              onAuxClick={(event) =>
                openPageWithMouseWheel(event, "library")
              }
              size="icon"
              type="button"
            >
              <Library className="size-6 text-current" />
              <span className="text-[10px]">{t("sidebar.document")}</span>
            </Button>
            <Button
              aria-label={t("sidebar.dictionary")}
              className="border-t w-[52px] h-[52px] gap-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("dictionary")}
              onAuxClick={(event) =>
                openPageWithMouseWheel(event, "dictionary")
              }
              size="icon"
              type="button"
            >
              <BookA className="size-6 text-current" />
              <span className="text-[10px]">{t("sidebar.dictionary")}</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

type SidebarGroupProps = {
  title: string;
  items: string[];
  icon: ReactElement;
  isOpen: boolean;
  menuLabel: string;
  onMenuNavigate: () => void;
  onMenuOpenInNewTab: () => void;
  onItemClick: (item: string) => void;
  onItemOpenInNewTab: (item: string) => void;
  onToggle: () => void;
};

function SidebarGroup({
  title,
  items,
  icon,
  isOpen,
  menuLabel,
  onMenuNavigate,
  onMenuOpenInNewTab,
  onItemClick,
  onItemOpenInNewTab,
  onToggle,
}: SidebarGroupProps) {
  const handleMouseWheelClick = (
    event: MouseEvent<HTMLButtonElement>,
    callback: () => void
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    callback();
  };

  return (
    <section className="grid px-2 py-1">
      <div
        className="flex h-9 cursor-pointer px-2 gap-2 items-center rounded-lg border-0 bg-transparent text-left text-[14px] font-semibold uppercase text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
        onClick={onToggle}
        aria-expanded={isOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isOpen ? <ChevronDown className="size-6" /> : <ChevronRight className="size-6" />}
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </div>
      {isOpen && (
        <div className="grid">
          {items.map((item) => (
            <button
              className="flex h-9 w-full min-w-0 cursor-pointer px-2 py-2 items-center gap-2 border-0 bg-transparent rounded-lg text-left text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              key={item}
              onClick={() => onItemClick(item)}
              onAuxClick={(event) =>
                handleMouseWheelClick(event, () => onItemOpenInNewTab(item))
              }
              type="button"
            >
              {icon}
              <span className="min-w-0 flex-1 truncate">{item}</span>
            </button>
          ))}
          <button
              className="flex h-9 cursor-pointer px-2 py-2 gap-2 text-[12px] items-center rounded-lg border-0 bg-transparent text-left text-[12px] font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              onClick={onMenuNavigate}
              onAuxClick={(event) =>
                handleMouseWheelClick(event, onMenuOpenInNewTab)
              }
              type="button"
          >
            <ArrowRight className="size-4" />
            <span>{menuLabel}</span>
          </button>
        </div>
      )}
    </section>
  );
}
