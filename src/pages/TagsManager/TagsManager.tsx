import { useTranslation } from "react-i18next";
import { PageShell } from "@/pages/PageShell";
import { AddTagButton, AddTagDialog } from "./AddTagButton";
import { TagSearchForm } from "./TagSearchForm";
import { TagsPagination } from "./TagsPagination";
import { TagsSortMenu } from "./TagsSortMenu";
import { TagsTable } from "./TagsTable/TagsTable";
import { DeleteConfirmationDialog } from "./TagsTable/TagNameCellContent";
import { TagManagerProvider } from "./useTagManager";

type TagsManagerProps = {
  onOpenTagInNewTab: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
};

export function TagsManager({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsManagerProps) {
  return (
    <TagManagerProvider>
      <TagsManagerContent
        onOpenTagInNewTab={onOpenTagInNewTab}
        onSelectTag={onSelectTag}
      />
    </TagManagerProvider>
  );
}

function TagsManagerContent({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsManagerProps) {
  const { t } = useTranslation();

  return (
    <PageShell breadcrumbs={[{ label: t("pages.tags") }, { label: "1" }]}>
      <div className="grid min-h-0 gap-[16px] overflow-y-auto pr-[8px]">
        <div className="flex flex-row gap-[8px] sm:items-center sm:justify-between">
          <TagSearchForm />
          <div className="flex shrink-0 items-center gap-[8px]">
            <TagsSortMenu />
            <AddTagButton />
          </div>
        </div>

        <TagsPagination />

        <TagsTable
          onOpenTagInNewTab={onOpenTagInNewTab}
          onSelectTag={onSelectTag}
        />

        <TagsPagination />
      </div>

      <AddTagDialog />
      <DeleteConfirmationDialog />
    </PageShell>
  );
}
