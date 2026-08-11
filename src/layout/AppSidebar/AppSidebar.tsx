import {
  BookA,
  CircleDot,
  KanbanSquare,
  Library,
  Search
} from "lucide-react";
import { useEffect, type MouseEvent } from "react";
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
import { AppSidebarItem, AppSidebarSimpleItem } from "./AppSidebarItem";
import { AppSidebarToggle } from "./AppSidebarToggle";
import { SidebarGroup } from "./SidebarGroup";

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
  const isProjectListOpen = useSettings((state) => state.isProjectListOpen);
  const setIsProjectListOpen = useSettings((state) => state.setIsProjectListOpen);
  const isLibraryOpen = useSettings((state) => state.isLibraryOpen);
  const setIsLibraryOpen = useSettings((state) => state.setIsLibraryOpen);
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
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-0 bg-header text-sidebar-foreground gap-2 ${
        isSidebarOpen ? "w-[180px]" : "w-[56px]"
      }`}
      aria-label={t("a11y.primarySidebar")}
    >
      <div
        className={`flex w-full shrink-0 ${
          isSidebarOpen ? "justify-end" : "justify-center"
        }`}
      >
        <AppSidebarToggle />
      </div>

      {isSidebarOpen ? (
        <div className="hover-scrollbar-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-[12px]">
          <AppSidebarItem
            icon={<Search className="size-6" />}
            label={t("sidebar.search")}
            onClick={() => onNavigate("search")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
          />

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

          <AppSidebarItem
            icon={<BookA className="size-6 text-current" />}
            label={t("sidebar.dictionary")}
            onClick={() => onNavigate("dictionary")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "dictionary")
            }
          />
        </div>
      ) : (
        <div className="hover-scrollbar-y grid min-h-0 flex-1 content-start justify-center gap-2 overflow-x-hidden overflow-y-auto px-[2px] pt-[10px]">
          <AppSidebarSimpleItem
            icon={<Search className="size-6" />}
            label={t("sidebar.search")}
            onClick={() => onNavigate("search")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
          />
          <AppSidebarSimpleItem
            icon={<KanbanSquare className="size-6 text-current" />}
            label={t("sidebar.projects")}
            onClick={() => onNavigate("projects")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "projects")}
          />
          <AppSidebarSimpleItem
            icon={<Library className="size-6 text-current" />}
            label={t("sidebar.document")}
            onClick={() => onNavigate("library")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "library")
            }
          />
          <AppSidebarSimpleItem
            icon={<BookA className="size-6 text-current" />}
            label={t("sidebar.dictionary")}
            onClick={() => onNavigate("dictionary")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "dictionary")
            }
          />
        </div>
      )}
    </aside>
  );
}
