import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Library,
} from "lucide-react";
import { useEffect, type MouseEvent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/features/workspace/workspaceStore";
import {
  WORKSPACE_TYPE,
  type WorkspaceType,
} from "@/features/workspace/types";
import { useSettings } from "@/hooks/useSettings";

const favoriteWorkspaceLimit = 5;

function useFavoriteWorkspaceNames(workspaceType: WorkspaceType) {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);

  useEffect(() => {
    void loadWorkspaces(workspaceType).catch(() => undefined);
  }, [loadWorkspaces, workspaceType]);

  return workspaces
    .filter(
      (workspace) =>
        workspace.workspaceType === workspaceType && workspace.isFavorite,
    )
    .sort(
      (first, second) =>
        Date.parse(second.updatedAt) - Date.parse(first.updatedAt),
    )
    .slice(0, favoriteWorkspaceLimit)
    .map((workspace) => workspace.name);
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

type DedicatedSidebarGroupProps = Pick<
  SidebarGroupProps,
  | "onMenuNavigate"
  | "onMenuOpenInNewTab"
  | "onItemClick"
  | "onItemOpenInNewTab"
>;

export function ProjectSidebarGroup(props: DedicatedSidebarGroupProps) {
  const { t } = useTranslation();
  const projectItems = useFavoriteWorkspaceNames(WORKSPACE_TYPE.PROJECT);
  const isProjectListOpen = useSettings((state) => state.isProjectListOpen);
  const setIsProjectListOpen = useSettings(
    (state) => state.setIsProjectListOpen,
  );

  return (
    <SidebarGroup
      {...props}
      items={projectItems}
      title={t("sidebar.projects")}
      icon={<CircleDot className="size-6 text-current" />}
      isOpen={isProjectListOpen}
      menuLabel={t("sidebar.projectList")}
      onToggle={() => setIsProjectListOpen((isOpen) => !isOpen)}
    />
  );
}

export function LibrarySidebarGroup(props: DedicatedSidebarGroupProps) {
  const { t } = useTranslation();
  const documentItems = useFavoriteWorkspaceNames(WORKSPACE_TYPE.LIBRARY);
  const isLibraryOpen = useSettings((state) => state.isLibraryOpen);
  const setIsLibraryOpen = useSettings((state) => state.setIsLibraryOpen);

  return (
    <SidebarGroup
      {...props}
      items={documentItems}
      title={t("sidebar.library")}
      icon={<Library className="size-6 text-current" />}
      isOpen={isLibraryOpen}
      menuLabel={t("sidebar.libraryList")}
      onToggle={() => setIsLibraryOpen((isOpen) => !isOpen)}
    />
  );
}
