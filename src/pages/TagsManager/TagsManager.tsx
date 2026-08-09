import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { SearchForm } from "@/components/app/SearchForm";
import { TagColorPalette } from "@/components/app/TagColorPalette";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";
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
    createTag,
    error,
    isCreateDialogOpen,
    isCreating,
    isDeleting,
    newTagColor,
    newTagName,
    resetCreateDialog,
    search,
    searchInput,
    setIsCreateDialogOpen,
    setNewTagColor,
    setNewTagName,
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
            <CreateNewButton onClick={() => setIsCreateDialogOpen(true)} />
          </div>
        </div>

        <TagsPagination />

        <TagsTable
          onOpenTagInNewTab={onOpenTagInNewTab}
          onSelectTag={onSelectTag}
        />

        <TagsPagination />
      </div>

      <Dialog
        onOpenChange={(open) =>
          open ? setIsCreateDialogOpen(true) : resetCreateDialog()
        }
        open={isCreateDialogOpen}
      >
        <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl p-[16px]">
          <DialogHeader>
            <DialogTitle className="my-[4px] text-lg font-semibold uppercase leading-[18px] tracking-[0.02em]">
              {t("tags.createTag")}
            </DialogTitle>
            <DialogDescription className="my-[4px] text-sm text-muted-foreground">
              {t("tags.createHelp")}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid w-full min-w-0 gap-[16px]"
            onSubmit={(event) => {
              event.preventDefault();
              void createTag();
            }}
          >
            <Input
              aria-label={t("tags.tagName")}
              autoFocus
              className="h-[36px] w-full min-w-0 rounded-md px-[8px]"
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder={t("tags.tagName")}
              value={newTagName}
            />
            <TagColorPalette
              onColorChange={setNewTagColor}
              selectedColorId={newTagColor}
            />
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter className="flex-row justify-end gap-[16px]">
              <Button
                className="w-[100px] rounded-md p-[8px] text-foreground"
                onClick={resetCreateDialog}
                type="button"
                variant="outline"
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="w-[100px] rounded-md bg-[#238636] p-[8px] text-[#fff] hover:bg-[#2ea043]"
                disabled={!newTagName.trim() || isCreating}
                type="submit"
              >
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
