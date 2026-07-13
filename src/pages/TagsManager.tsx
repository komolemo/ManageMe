import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { TagColorPalette } from "@/components/app/TagColorPalette";
import { useCreateTag } from "@/hooks/useTags";
import { PageShell } from "@/pages/PageShell";
import { tagColors, tags, type TagColorName } from "@/pages/tagsData";
import { useTranslation } from "react-i18next";

const pageSize = 50;
const defaultTagColor = tagColors[0].id;
const tagColorById = new Map(tagColors.map((color) => [color.id, color]));
const tagColorByName = new Map(tagColors.map((color) => [color.name, color]));

function resolveTagColor(color: number | TagColorName) {
  return typeof color === "number"
    ? tagColorById.get(color)
    : tagColorByName.get(color);
}

function resolveTagColorId(color: number | TagColorName) {
  return resolveTagColor(color)?.id ?? Number.MAX_SAFE_INTEGER;
}

type SortKey = "tag" | "color" | "lastUsed" | "links";

type TagsManagerProps = {
  onOpenTagInNewTab: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
};

export function TagsManager({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsManagerProps) {
  const { t } = useTranslation();
  const [tagItems, setTagItems] = useState(tags);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("tag");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(defaultTagColor);
  const addTag = useCreateTag(setTagItems);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTags = useMemo(() => {
    if (!normalizedQuery) {
      return tagItems;
    }

    return tagItems.filter((tag) =>
      [tag.name, resolveTagColor(tag.color)?.name, tag.lastUsed]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, tagItems]);

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((firstTag, secondTag) => {
      if (sortKey === "lastUsed") {
        return secondTag.lastUsed.localeCompare(firstTag.lastUsed);
      }

      if (sortKey === "color") {
        return (
          resolveTagColorId(firstTag.color) - resolveTagColorId(secondTag.color)
        );
      }

      if (sortKey === "links") {
        const firstLinks =
          firstTag.linkedSets.length + firstTag.linkedDocuments.length;
        const secondLinks =
          secondTag.linkedSets.length + secondTag.linkedDocuments.length;

        return secondLinks - firstLinks;
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortKey(value as SortKey);
    setCurrentPage(1);
  };

  const openTagWithMouseWheel = (
    event: MouseEvent<HTMLTableRowElement>,
    tagId: string
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenTagInNewTab(tagId);
  };

  const resetCreateDialog = () => {
    setNewTagName("");
    setNewTagColor(defaultTagColor);
    setIsCreateDialogOpen(false);
  };

  const createTag = () => {
    const nextTag = addTag({
      color: newTagColor,
      name: newTagName,
    });

    if (!nextTag) {
      return;
    }

    resetCreateDialog();
  };

  return (
    <PageShell breadcrumbs={[{ label: t("pages.tags") }, { label: "1" }]}>
      <div className="grid h-full min-h-0 gap-[16px] pr-[8px] overflow-y-auto">
        <div className="flex flex-row gap-[8px] sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            {/* <Search className="pointer-events-none absolute left-[10px] top-1/2 size-6 -translate-y-1/2 text-muted-foreground" /> */}
            <Input
              aria-label={t("tags.tagSearch")}
              className="h-[32px] px-[12px] py-[5px] rounded-md"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t("tags.searchTags")}
              type="search"
              value={searchQuery}
            />
          </div>
          <div className="flex shrink-0 items-center gap-[8px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-[32px] pl-[8px] pr-[16px] py-1 gap-[4px] rounded-md text-foreground bg-transparent border border-muted hover:bg-muted/50"
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ArrowUpDown className="size-4" />
                  <span className="font-[600]">{t("sort.sort")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[160px]" align="end">
                <DropdownMenuRadioGroup
                  onValueChange={handleSortChange}
                  value={sortKey}
                >
                  <DropdownMenuRadioItem value="tag">{t("tags.tag")}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="color">
                    {t("sort.color")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lastUsed">
                    {t("sort.lastUsed")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="links">
                    {t("sort.links")}
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
              <col className="w-[42%]" />
              <col className="w-[20%]" />
              <col className="w-[24%]" />
              <col className="w-[14%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4">{t("tags.tag")}</TableHead>
                <TableHead className="px-4">{t("sort.color")}</TableHead>
                <TableHead className="px-4">{t("sort.lastUsed")}</TableHead>
                <TableHead className="px-4 text-right">{t("sort.links")}</TableHead>
              </TableRow>
              {/* <TableRow aria-hidden className="border-b hover:bg-transparent">
                <TableHead className="h-px p-0" colSpan={4}>
                  <div className="h-px bg-border" />
                </TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {visibleTags.length > 0 ? (
                visibleTags.map((tag) => {
                  const tagColor = resolveTagColor(tag.color);

                  return (
                    <TableRow
                      className="cursor-pointer"
                      key={tag.id}
                      onClick={() => onSelectTag(tag.id)}
                      onAuxClick={(event) =>
                        openTagWithMouseWheel(event, tag.id)
                      }
                    >
                    {/* "タグ名" 列 */}
                    <TableCell className="pl-4 py-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <Tag className="size-6 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{tag.name}</span>
                      </span>
                    </TableCell>
                    <TableCell className="pl-4 py-1">
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
                          {tagColor ? t(`colors.${tagColor.name}`) : tag.color}
                        </span>
                      </span>
                    </TableCell>
                    {/* "最新利用日" 列 */}
                    <TableCell className="pl-4 py-1 text-muted-foreground">
                      {tag.lastUsed}
                    </TableCell>
                    {/* "リンク数" 列 */}
                    <TableCell className="pr-4 py-1 text-right">
                      <Badge className="border-0" variant="outline">
                        {tag.linkedSets.length + tag.linkedDocuments.length}
                      </Badge>
                    </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    className="h-[96px] text-center text-muted-foreground"
                    colSpan={4}
                  >
                    {t("tags.noneFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {t("sort.showing")} {visibleStart}-{visibleEnd} {t("sort.of")} {sortedTags.length}
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
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsCreateDialogOpen(true);
            return;
          }

          resetCreateDialog();
        }}
      >
        <DialogContent className="p-[16px] gap-[16px] max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="my-[4px] text-lg font-semibold leading-[18px] tracking-[0.02em] uppercase">
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
              createTag();
            }}
          >
            <Input
              aria-label={t("tags.tagName")}
              autoFocus
              className="h-[36px] w-full min-w-0 box-border px-[8px] rounded-md"
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder={t("tags.tagName")}
              value={newTagName}
            />
            <TagColorPalette
              selectedColorId={newTagColor}
              onColorChange={setNewTagColor}
            />
            <DialogFooter className="flex-row justify-end gap-[16px]">
              <Button
                className="w-[100px] p-[8px] rounded-md text-foreground"
                onClick={resetCreateDialog}
                type="button"
                variant="outline"
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="w-[100px] p-[8px] rounded-md bg-[#238636] hover:bg-[#2ea043] text-[#fff]"
                disabled={!newTagName.trim()}
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
