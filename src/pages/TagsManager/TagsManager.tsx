import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { SearchForm } from "@/components/app/SearchForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageShell } from "@/pages/PageShell";
import { AddTagButton, AddTagDialog } from "./AddTagButton";
import { TagsPagination } from "./TagsPagination";
import { TagsTable } from "./TagsTable";
import {
  TagManagerProvider,
  useTagManager,
  type TagSortKey,
} from "./useTagManager";

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
  const {
    changeSearchInput,
    changeSort,
    confirmDeleteTag,
    isDeleting,
    search,
    searchInput,
    setTagToDelete,
    sortKey,
    tagToDelete,
  } = useTagManager();

  return (
    <PageShell breadcrumbs={[{ label: t("pages.tags") }, { label: "1" }]}>
      <div className="grid min-h-0 gap-[16px] overflow-y-auto pr-[8px]">
        <div className="flex flex-row gap-[8px] sm:items-center sm:justify-between">
          <SearchForm
            aria-label={t("tags.tagSearch")}
            className="h-[32px] w-full"
            classNames={{ input: "h-[30px] py-[5px]" }}
            inputId="tag-search-query"
            onChange={changeSearchInput}
            onSearch={search}
            placeholder={t("tags.searchTags")}
            value={searchInput}
          />
          <div className="flex shrink-0 items-center gap-[8px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-[32px] gap-[4px] rounded-md border border-muted bg-transparent py-1 pl-[8px] pr-[16px] text-foreground hover:bg-muted/50"
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ArrowUpDown className="size-4" />
                  <span className="font-[600]">{t("sort.sort")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuRadioGroup
                  onValueChange={(value) =>
                    changeSort(value as TagSortKey)
                  }
                  value={sortKey}
                >
                  <DropdownMenuRadioItem value="tag">
                    {t("tags.tag")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="color">
                    {t("sort.color")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lastUsed">
                    {t("sort.lastUsed")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
      <DeleteConfirmationDialog
        description={t("tags.deleteDescription", {
          tagName: tagToDelete?.name ?? "",
        })}
        isDeleting={isDeleting}
        onConfirm={() => void confirmDeleteTag()}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setTagToDelete(null);
          }
        }}
        open={tagToDelete !== null}
        title={t("tags.deleteTitle")}
      />
    </PageShell>
  );
}
