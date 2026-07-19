import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTagStore } from "@/features/tag/tagStore";
import { PageShell } from "@/pages/PageShell";
import { tagColors } from "@/pages/tagsData";

const pageSize = 50;
const defaultTagColor = tagColors[0].id;
const tagColorById = new Map(tagColors.map((color) => [color.id, color]));

type SortKey = "tag" | "color" | "lastUsed";

type TagsManagerProps = {
  onOpenTagInNewTab: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
};

export function TagsManager({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsManagerProps) {
  const { t } = useTranslation();
  const tags = useTagStore((state) => state.tags);
  const isLoading = useTagStore((state) => state.isLoading);
  const error = useTagStore((state) => state.error);
  const loadTags = useTagStore((state) => state.loadTags);
  const createTagInStore = useTagStore((state) => state.createTag);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("tag");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(defaultTagColor);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    void loadTags().catch(() => undefined);
  }, [loadTags]);

  const filteredTags = useMemo(() => {
    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter((tag) => {
      const colorName =
        tag.colorId === null ? "" : tagColorById.get(tag.colorId)?.name ?? "";
      return [tag.name, colorName, tag.lastUsedAt ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [normalizedQuery, tags]);

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((firstTag, secondTag) => {
      if (sortKey === "lastUsed") {
        return (secondTag.lastUsedAt ?? "").localeCompare(
          firstTag.lastUsedAt ?? "",
        );
      }
      if (sortKey === "color") {
        return (
          (firstTag.colorId ?? Number.MAX_SAFE_INTEGER) -
          (secondTag.colorId ?? Number.MAX_SAFE_INTEGER)
        );
      }
      return firstTag.name.localeCompare(secondTag.name);
    });
  }, [filteredTags, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedTags.length / pageSize));
  const boundedPage = Math.min(currentPage, totalPages);
  const pageStart = (boundedPage - 1) * pageSize;
  const visibleTags = sortedTags.slice(pageStart, pageStart + pageSize);
  const visibleStart = sortedTags.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, sortedTags.length);

  const resetCreateDialog = () => {
    setNewTagName("");
    setNewTagColor(defaultTagColor);
    setIsCreateDialogOpen(false);
  };

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name || isCreating) {
      return;
    }

    setIsCreating(true);
    try {
      await createTagInStore({
        tagId: crypto.randomUUID(),
        name,
        colorId: newTagColor,
        description: "",
      });
      resetCreateDialog();
    } catch {
      // The store exposes backend errors through `error`.
    } finally {
      setIsCreating(false);
    }
  };

  const openTagWithMouseWheel = (
    event: MouseEvent<HTMLTableRowElement>,
    tagId: string,
  ) => {
    if (event.button === 1) {
      event.preventDefault();
      onOpenTagInNewTab(tagId);
    }
  };

  return (
    <PageShell breadcrumbs={[{ label: t("pages.tags") }, { label: "1" }]}>
      <div className="grid min-h-0 gap-[16px] overflow-y-auto pr-[8px]">
        <div className="flex flex-row gap-[8px] sm:items-center sm:justify-between">
          <SearchForm
            aria-label={t("tags.tagSearch")}
            className="h-[32px] w-full sm:max-w-[360px]"
            classNames={{ input: "h-[30px] py-[5px]" }}
            inputId="tag-search-query"
            onChange={(value) => {
              setSearchInput(value);
              if (!value) {
                setSearchQuery("");
                setCurrentPage(1);
              }
            }}
            onSearch={(query) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
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
                  onValueChange={(value) => {
                    setSortKey(value as SortKey);
                    setCurrentPage(1);
                  }}
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

        <div className="border py-1">
          <Table className="table-fixed border-collapse">
            <colgroup>
              <col className="w-[48%]" />
              <col className="w-[24%]" />
              <col className="w-[28%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4">{t("tags.tag")}</TableHead>
                <TableHead className="px-4">{t("sort.color")}</TableHead>
                <TableHead className="px-4">{t("sort.lastUsed")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && tags.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="h-[96px] text-center text-muted-foreground"
                    colSpan={3}
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
                        <span className="flex min-w-0 items-center gap-2">
                          <Tag className="size-6 shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium">{tag.name}</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-1 pl-4">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden
                            className="size-6 shrink-0 rounded-full border border-border"
                            style={{
                              backgroundColor:
                                tagColor?.backgroundValue ?? "#ffffff",
                              borderColor: tagColor?.value ?? "#d1d5db",
                            }}
                          />
                          <span className="truncate text-muted-foreground">
                            {tagColor
                              ? t(`colors.${tagColor.name}`)
                              : tag.colorId ?? "-"}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-1 pl-4 text-muted-foreground">
                        {tag.lastUsedAt ?? "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    className="h-[96px] text-center text-muted-foreground"
                    colSpan={3}
                  >
                    {error ?? t("tags.noneFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {t("sort.showing")} {visibleStart}-{visibleEnd} {t("sort.of")}{" "}
            {sortedTags.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              aria-label={t("a11y.previousTagPage")}
              disabled={boundedPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <span className="min-w-[72px] text-center">
              {boundedPage} / {totalPages}
            </span>
            <Button
              aria-label={t("a11y.nextTagPage")}
              disabled={boundedPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>
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
    </PageShell>
  );
}
