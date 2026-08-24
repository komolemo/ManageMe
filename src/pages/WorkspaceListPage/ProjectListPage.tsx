import { Kanban } from "lucide-react";
import { WorkspaceList } from "@/pages/WorkspaceListPage/workspaceList";
import { WORKSPACE_TYPE } from "@/features/workspace/types";
import type { Workspace } from "@/features/workspace/types";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import { ProjectWorkspaceList } from "@/components/app/ProjectWorkspaceList";
import { DetailSidebarHeader } from "@/layout/DetailSidebar/DetailSidebarHeader";

type ProjectListPageProps = {
  activeWorkspaceId?: string;
  onNavigate: (page: PageKey, workspace: Workspace) => void;
  onOpenInNewTab: (page: PageKey, workspace: Workspace) => void;
};

export function ProjectListPage({
  activeWorkspaceId,
  onNavigate,
  onOpenInNewTab,
}: ProjectListPageProps) {
  const { t } = useTranslation();

  return (
    <WorkspaceList
      breadcrumbLabel={t("workspace.projects")}
      createDescription={t("workspace.projectDescription")}
      createItemDescription=""
      detailSidebar={
        <ProjectWorkspaceList
          activeWorkspaceId={activeWorkspaceId}
          filter=""
          onOpenProject={(workspace) => onNavigate("project", workspace)}
          onOpenProjectInNewTab={(workspace) =>
            onOpenInNewTab("project", workspace)
          }
        />
      }
      detailSidebarHeader={
        <DetailSidebarHeader name={t("sidebar.projectList")} />
      }
      entityLabel={t("workspace.projects")}
      icon={Kanban}
      iconId="kanban"
      workspaceType={WORKSPACE_TYPE.PROJECT}
      onOpenInNewTab={(workspace) => onOpenInNewTab("project", workspace)}
      onSelect={(workspace) => onNavigate("project", workspace)}
    />
  );
}
