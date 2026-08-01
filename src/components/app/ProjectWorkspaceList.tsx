import { useEffect, useMemo, useState } from "react";
import { Kanban, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MenuButton } from "@/components/app/MenuButton";
import { PageLink } from "@/components/app/PageLink";
import { SidebarItem } from "@/components/app/SidebarItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/features/workspace/workspaceStore";
import {
  WORKSPACE_TYPE,
  type Workspace,
} from "@/features/workspace/types";

type ProjectWorkspaceListProps = {
  activeWorkspaceId?: string;
  filter: string;
  onOpenProject: (workspace: Workspace) => void;
  onOpenProjectInNewTab: (workspace: Workspace) => void;
};

export function ProjectWorkspaceList({
  activeWorkspaceId,
  filter,
  onOpenProject,
  onOpenProjectInNewTab,
}: ProjectWorkspaceListProps) {
  const { t } = useTranslation();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const isLoading = useWorkspaceStore(
    (state) => state.loadingTypes[WORKSPACE_TYPE.PROJECT] ?? false,
  );
  const error = useWorkspaceStore((state) => state.error);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const projects = useMemo(
    () =>
      workspaces
        .filter(
          (workspace) =>
            workspace.workspaceType === WORKSPACE_TYPE.PROJECT &&
            (!normalizedFilter ||
              workspace.name.toLocaleLowerCase().includes(normalizedFilter)),
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [normalizedFilter, workspaces],
  );

  useEffect(() => {
    void loadWorkspaces(WORKSPACE_TYPE.PROJECT).catch(() => undefined);
  }, [loadWorkspaces]);

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateError(null);
    setProjectName("");
  };

  const createProject = async () => {
    const name = projectName.trim();
    if (!name || isCreating) return;

    setCreateError(null);
    setIsCreating(true);
    const id = crypto.randomUUID();

    try {
      await createWorkspace({
        description: "",
        iconId: "kanban",
        name,
        workspaceId: id,
        workspaceKey: `${WORKSPACE_TYPE.PROJECT}-${id}`,
        workspaceType: WORKSPACE_TYPE.PROJECT,
      });
      closeDialog();
    } catch (cause) {
      setCreateError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid gap-[4px]">
      <div className="flex h-8 items-center justify-end pb-1">
        <Button
          aria-label={t("workspace.createProject")}
          className="size-7 rounded-sm border-0"
          onClick={() => setIsCreateDialogOpen(true)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Plus aria-hidden className="size-4" />
        </Button>
      </div>
      {isLoading ? (
        <p className="px-[8px] py-[4px] text-xs text-muted-foreground">
          Loading...
        </p>
      ) : null}
      {!isLoading && projects.length === 0 ? (
        <p className="px-[8px] py-[4px] text-xs text-muted-foreground">
          {t("workspace.notYetRegistered")}
        </p>
      ) : null}
      {error && projects.length > 0 ? (
        <p className="px-[8px] py-[4px] text-xs text-destructive">{error}</p>
      ) : null}
      {projects.map((project) => {
        const isActive = project.workspaceId === activeWorkspaceId;

        return (
          <SidebarItem key={project.workspaceId} selected={isActive}>
            <div
              className="
                box-border flex min-w-0 flex-1 cursor-pointer items-center overflow-hidden
                border-0 bg-transparent px-0 py-1.5 text-left text-[14px]
                text-muted-foreground transition-colors
              "
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault();
                  onOpenProjectInNewTab(project);
                }
              }}
              onClick={() => onOpenProject(project)}
              role="button"
              tabIndex={0}
            >
              <div className="flex max-w-full min-w-0 flex-1 items-center gap-1">
                <PageLink
                  displayName={project.name}
                  icon={Kanban}
                  pageName={project.name}
                />
              </div>
            </div>
            <MenuButton
              actions={[
                {
                  label: t("common.open"),
                  onSelect: () => onOpenProject(project),
                },
                {
                  label: t("common.delete"),
                  onSelect: () => void deleteWorkspace(project.workspaceId),
                },
              ]}
              ariaLabel={t("a11y.itemActions", {
                itemName: project.name,
              })}
            />
          </SidebarItem>
        );
      })}
      <Dialog
        onOpenChange={(open) =>
          open ? setIsCreateDialogOpen(true) : closeDialog()
        }
        open={isCreateDialogOpen}
      >
        <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("workspace.createProject")}</DialogTitle>
            <DialogDescription>
              {t("workspace.projectDescription")}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void createProject();
            }}
          >
            <Input
              aria-label={t("workspace.projectName")}
              autoFocus
              onChange={(event) => setProjectName(event.target.value)}
              value={projectName}
            />
            {createError ? (
              <p className="text-sm text-destructive" role="alert">
                {createError}
              </p>
            ) : null}
            <DialogFooter>
              <Button onClick={closeDialog} type="button" variant="outline">
                {t("common.cancel")}
              </Button>
              <Button
                disabled={!projectName.trim() || isCreating}
                type="submit"
              >
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
