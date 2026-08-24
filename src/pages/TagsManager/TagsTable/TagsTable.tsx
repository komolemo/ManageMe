import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTagManager } from "../useTagManager";
import { TagColorCellContent } from "./TagColorCellContent";
import { TagCountCellContent } from "./TagCountCellContent";
import { TagLastUsedCellContent } from "./TagLastUsedCellContent";
import { TagNameCellContent } from "./TagNameCellContent";

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
    error,
    isLoading,
    tags,
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

  const tableHeadClass = "px-4 text-center";

  return (
    <Table className="table-fixed border">
      <colgroup>
        <col className="w-[46%]" />
        <col className="w-[12%]" />
        <col className="w-[12%]" />
        <col className="w-[12%]" />
        <col className="w-[18%]" />
      </colgroup>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={tableHeadClass}>{t("tags.tag")}</TableHead>
          <TableHead className={tableHeadClass}>{t("sort.color")}</TableHead>
          <TableHead className={tableHeadClass}>{t("top.tasks")}</TableHead>
          <TableHead className={tableHeadClass}>{t("top.documents")}</TableHead>
          <TableHead className={tableHeadClass}>{t("sort.lastUsed")}</TableHead>
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
                  <TagNameCellContent tag={tag} />
                </TableCell>
                <TableCell className="max-w-[120px] py-0 px-4">
                  <TagColorCellContent tag={tag} />
                </TableCell>
                <TableCell className="px-4 py-1 text-center text-muted-foreground">
                  <TagCountCellContent count={tag.taskCount} />
                </TableCell>
                <TableCell className="px-4 py-1 text-center text-muted-foreground">
                  <TagCountCellContent count={tag.documentCount} />
                </TableCell>
                <TableCell className="py-1 pl-4 text-center text-muted-foreground">
                  <TagLastUsedCellContent lastUsedAt={tag.lastUsedAt} />
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
