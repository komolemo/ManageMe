import { Kanban } from "lucide-react";
import { WorkspaceList } from "@/pages/WorkspaceListPage/workspaceList";
import { WORKSPACE_TYPE } from "@/features/workspace/types";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";

type ProjectListPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function ProjectListPage({ onNavigate, onOpenInNewTab }: ProjectListPageProps) {
  const { t } = useTranslation();
  return (
    <WorkspaceList
      breadcrumbLabel={t("workspace.projects")}
      createDescription={t("workspace.projectDescription")}
      createItemDescription=""
      entityLabel={t("workspace.projects")}
      icon={Kanban}
      iconId="kanban"
      workspaceType={WORKSPACE_TYPE.PROJECT}
      onOpenInNewTab={() => onOpenInNewTab("project")}
      onSelect={() => onNavigate("project")}
    />
  );
}
