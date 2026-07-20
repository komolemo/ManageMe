import { BookOpenText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WorkspaceList } from "@/pages/WorkspaceListPage/workspaceList";
import { WORKSPACE_TYPE } from "@/features/workspace/types";
import type { Workspace } from "@/features/workspace/types";

type LibraryPageProps = {
  onOpenDocument: (workspace: Workspace) => void;
  onOpenDocumentInNewTab: (workspace: Workspace) => void;
};

export function LibraryPage({ onOpenDocument, onOpenDocumentInNewTab }: LibraryPageProps) {
  const { t } = useTranslation();
  return (
    <WorkspaceList
      breadcrumbLabel={t("workspace.library")}
      createDescription={t("workspace.libraryDescription")}
      createItemDescription="Project Document for Task Document pages"
      entityLabel={t("workspace.library")}
      icon={BookOpenText}
      iconId="book-open-text"
      workspaceType={WORKSPACE_TYPE.LIBRARY}
      onOpenInNewTab={onOpenDocumentInNewTab}
      onSelect={onOpenDocument}
    />
  );
}
