import { Kanban } from "lucide-react";
import { WorkplaceList, type WorkplaceListItem } from "@/components/app/workplaceList";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";

type ProjectListPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

const projects: WorkplaceListItem[] = [
  { id: "manage-me-core", name: "ManageMe Core", description: "ph-1-0", isStarred: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z" },
  { id: "knowledge-document", name: "Knowledge Document", description: "ph-1-0", isStarred: false, createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z" },
  { id: "desktop-shell", name: "Desktop Shell", description: "ph-1-1", isStarred: false, createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-02-03T00:00:00.000Z" },
];

export function ProjectListPage({ onNavigate, onOpenInNewTab }: ProjectListPageProps) {
  const { t } = useTranslation();
  return (
    <WorkplaceList
      breadcrumbLabel={t("workplace.projects")}
      createDescription={t("workplace.projectDescription")}
      createItemDescription=""
      entityLabel={t("workplace.project")}
      icon={Kanban}
      idPrefix="project"
      initialItems={projects}
      onOpenInNewTab={() => onOpenInNewTab("project")}
      onSelect={() => onNavigate("project")}
    />
  );
}
