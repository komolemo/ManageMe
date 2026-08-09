import type { MouseEvent } from "react";
import { ArrowUpDown, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { EditableName1 } from "@/components/app/EditableName";
import { MenuButton } from "@/components/app/MenuButton";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tagColorById, tagColors } from "@/features/tag/tagColors";
import { PageShell } from "@/pages/PageShell";
import { useTagManager, type TagSortKey } from "./useTagManager";

type TagsManagerProps = {
  onOpenTagInNewTab: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
};

export function TagsManager({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsManagerProps) {
  const { t } = useTranslation();
  const {
    changeSearchInput,
    changeSort,
    changeTagColor,
    changeTagName,
    confirmDeleteTag,
    createTag,
    currentPage,
    error,
    isCreateDialogOpen,
    isCreating,
    isDeleting,
    isLoading,
    newTagColor,
    newTagName,
    paginationEntries,
    resetCreateDialog,
    search,
    searchInput,
    setCurrentPage,
    setIsCreateDialogOpen,
    setNewTagColor,
    setNewTagName,
    setTagToDelete,
    sortKey,
    tagCount,
    tags,
    tagToDelete,
    totalPages,
    updatingTagId,
    visibleEnd,
    visibleStart,
    visibleTags,
  } = useTagManager();

  const openTagWithMouseWheel = (
    event: MouseEvent<HTMLTableRowElement>,
    tagId: string,
  ) => {
    if (event.button === 1) {
      event.preventDefault();
      onOpenTagInNewTab(tagId);
    }
  };

  const renderPagination = () => (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
      <span>
        {t("sort.showing")} {visibleStart}-{visibleEnd} {t("sort.of")}{" "}
        {tagCount}
      </span>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-label={t("a11y.previousTagPage")}
              aria-disabled={currentPage === 1}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              tabIndex={currentPage === 1 ? -1 : 0}
              text=""
            />
          </PaginationItem>
          {paginationEntries.map((entry) => (
            <PaginationItem key={entry}>
              {typeof entry === "number" ? (
                <PaginationLink
                  className="rounded-md"
                  href="#"
                  isActive={entry === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(entry);
                  }}
                >
                  {entry}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              aria-label={t("a11y.nextTagPage")}
              aria-disabled={currentPage === totalPages}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              tabIndex={currentPage === totalPages ? -1 : 0}
              text=""
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );

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

        {renderPagination()}

        <Table className="table-fixed border">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[22%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-center">{t("tags.tag")}</TableHead>
              <TableHead className="px-4 text-center">{t("sort.color")}</TableHead>
              <TableHead className="px-4 text-center">
                {t("top.tasks")}
              </TableHead>
              <TableHead className="px-4 text-center">
                {t("top.documents")}
              </TableHead>
              <TableHead className="px-4 text-center">{t("sort.lastUsed")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && tags.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-[96px] text-center text-muted-foreground"
                  colSpan={5}
                >
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            ) : visibleTags.length > 0 ? (
              visibleTags.map((tag) => {
                const tagColor =
                  tag.colorId === null
                    ? undefined
                    : tagColorById.get(tag.colorId);
                return (
                  <TableRow
                    className="cursor-pointer"
                    key={tag.tagId}
                    onAuxClick={(event) =>
                      openTagWithMouseWheel(event, tag.tagId)
                    }
                    onClick={() => onSelectTag(tag.tagId)}
                  >
                    <TableCell className="py-1 pl-4">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <Tag
                            className="size-6 shrink-0"
                            style={{
                              color: tagColor?.value,
                              fill: tagColor?.backgroundValue,
                            }}
                          />
                          <EditableName1
                            className="text-sm"
                            name={tag.name}
                            onSaveEditing={(name) =>
                              void changeTagName(tag, name)
                            }
                          />
                        </span>
                        <span
                          className="shrink-0"
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <MenuButton
                            actions={[
                              {
                                label: t("common.delete"),
                                onSelect: () => setTagToDelete(tag),
                              },
                            ]}
                            ariaLabel={t("tags.openMenu", {
                              tagName: tag.name,
                            })}
                          />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-1 max-w-[120px]">
                      <span
                        className="flex min-w-0 justify-center"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label={t("tags.changeColor")}
                              className="h-8 min-w-0 justify-start gap-2 border-0 bg-transparent px-0 text-muted-foreground hover:bg-muted/50"
                              disabled={updatingTagId === tag.tagId}
                              type="button"
                              variant="ghost"
                            >
                              <span
                                aria-hidden
                                className="size-6 shrink-0 rounded-full border-[2px]"
                                style={{
                                  backgroundColor: tagColor?.backgroundValue,
                                  backgroundClip: "padding-box",
                                  borderColor: tagColor?.value,
                                }}
                              />
                              <span className="min-w-12 truncate">
                                {tagColor
                                  ? t(`colors.${tagColor.name}`)
                                  : tag.colorId ?? "-"}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[180px]" align="start">
                            <DropdownMenuRadioGroup
                              onValueChange={(value) =>
                                void changeTagColor(tag, Number(value))
                              }
                              value={tag.colorId?.toString() ?? ""}
                            >
                              {tagColors.map((color) => (
                                <DropdownMenuRadioItem
                                  key={color.id}
                                  value={color.id.toString()}
                                >
                                  <span
                                    aria-hidden
                                    className="size-5 rounded-full border"
                                    style={{
                                      backgroundColor: color.backgroundValue,
                                      borderColor: color.value,
                                    }}
                                  />
                                  <span>{t(`colors.${color.name}`)}</span>
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1 text-center text-muted-foreground">
                      {tag.taskCount}
                    </TableCell>
                    <TableCell className="px-4 py-1 text-center text-muted-foreground">
                      {tag.documentCount}
                    </TableCell>
                    <TableCell className="py-1 pl-4  text-center text-muted-foreground">
                      {tag.lastUsedAt ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  className="h-[96px] text-center text-muted-foreground"
                  colSpan={5}
                >
                  {error ?? t("tags.noneFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {renderPagination()}
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
