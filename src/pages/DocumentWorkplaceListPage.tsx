import { BookOpenText } from "lucide-react";
import { WorkplaceList, type WorkplaceListItem } from "@/components/app/workplaceList";

const documents: WorkplaceListItem[] = [
  { id: "manage-me-document", name: "ManageMe Document", description: "Project Document for Task Document pages", isStarred: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-03T00:00:00.000Z" },
  { id: "requirements-document", name: "Requirements Document", description: "Project Document for Task Document pages", isStarred: false, createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z" },
  { id: "design-document", name: "Design Document", description: "Project Document for Task Document pages", isStarred: false, createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z" },
];

type ProjectDocumentListPageProps = {
  onOpenDocument: (title: string) => void;
  onOpenDocumentInNewTab: (title: string) => void;
};

export function ProjectDocumentListPage({ onOpenDocument, onOpenDocumentInNewTab }: ProjectDocumentListPageProps) {
  return (
    <WorkplaceList
      breadcrumbLabel="Document"
      createDescription="Enter a name for the new Document."
      createItemDescription="Project Document for Task Document pages"
      entityLabel="Document"
      icon={BookOpenText}
      idPrefix="document"
      initialItems={documents}
      onOpenInNewTab={(document) => onOpenDocumentInNewTab(document.name)}
      onSelect={(document) => onOpenDocument(document.name)}
    />
  );
}
