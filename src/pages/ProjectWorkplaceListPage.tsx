import { Kanban } from "lucide-react";
import { WorkplaceList, type WorkplaceListItem } from "@/components/app/workplaceList";
import type { PageKey } from "@/pages/pageTypes";

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
  return (
    <WorkplaceList
      breadcrumbLabel="Projects"
      createDescription="Enter a name for the new project."
      createItemDescription=""
      entityLabel="Project"
      icon={Kanban}
      idPrefix="project"
      initialItems={projects}
      onOpenInNewTab={() => onOpenInNewTab("project")}
      onSelect={() => onNavigate("project")}
    />
  );
}
