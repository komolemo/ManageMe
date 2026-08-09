import type { MouseEvent } from "react";
import { Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditableName1 } from "@/components/app/EditableName";
import { MenuButton } from "@/components/app/MenuButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tagColorById, tagColors } from "@/features/tag/tagColors";
import { useTagManager } from "./useTagManager";

type TagsTableProps = {
  onOpenTagInNewTab: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
};

export function TagsTable({
  onOpenTagInNewTab,
  onSelectTag,
}: TagsTableProps) {
  const { t } = useTranslation();
  const {
    changeTagColor,
    changeTagName,
    error,
    isLoading,
    setTagToDelete,
    tags,
    updatingTagId,
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

  return (
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
          <TableHead className="px-4 text-center">{t("top.tasks")}</TableHead>
          <TableHead className="px-4 text-center">
            {t("top.documents")}
          </TableHead>
          <TableHead className="px-4 text-center">
            {t("sort.lastUsed")}
          </TableHead>
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
                      <TagIcon
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
                        ariaLabel={t("tags.openMenu", { tagName: tag.name })}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[120px] px-4 py-1">
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
                      <DropdownMenuContent align="start" className="w-[180px]">
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
                <TableCell className="py-1 pl-4 text-center text-muted-foreground">
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
  );
}
