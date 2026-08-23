import {
  memo,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import { useTranslation } from "react-i18next";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ProjectTableColumn, ProjectTableColumnKey } from "./ProjectTable";

type Props = {
  columns: ProjectTableColumn[];
  onColumnOrderChange: Dispatch<SetStateAction<ProjectTableColumnKey[]>>;
};

export const ProjectTableHeader = memo(function ProjectTableHeader({
  columns,
  onColumnOrderChange,
}: Props) {
  const { t } = useTranslation();
  const [dragged, setDragged] = useState<ProjectTableColumnKey | null>(null);
  const [dragOver, setDragOver] = useState<ProjectTableColumnKey | null>(null);
  const [position, setPosition] = useState<"before" | "after">("before");
  const clearDrag = () => {
    setDragged(null);
    setDragOver(null);
    setPosition("before");
  };
  const startDrag = (
    event: DragEvent<HTMLTableCellElement>,
    key: ProjectTableColumnKey
  ) => {
    setDragged(key);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", key);
  };
  const dragColumn = (
    event: DragEvent<HTMLTableCellElement>,
    key: ProjectTableColumnKey
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOver(key);
    setPosition(event.clientX > rect.left + rect.width / 2 ? "after" : "before");
  };
  const dropColumn = (
    event: DragEvent<HTMLTableCellElement>,
    target: ProjectTableColumnKey
  ) => {
    event.preventDefault();
    const source =
      dragged ??
      (event.dataTransfer.getData("text/plain") as ProjectTableColumnKey);
    onColumnOrderChange((current) => {
      if (source === target || !current.includes(source)) return current;
      const next = current.filter((key) => key !== source);
      const index = next.indexOf(target);
      if (index < 0) return current;
      next.splice(position === "after" ? index + 1 : index, 0, source);
      return next;
    });
    clearDrag();
  };

  return (
    <TableHeader className="sticky top-0 z-20 bg-muted text-xs font-semibold text-muted-foreground">
      <TableRow className="hover:bg-muted">
        {columns.map((column) => {
          const isOver =
            dragOver === column.key && dragged !== column.key;
          return (
            <TableHead
              aria-label={t("project.moveColumn", { columnName: column.label })}
              className={cn(
                "h-auto cursor-grab select-none border-l-2 border-r-2",
                "px-[8px] py-[4px] text-muted-foreground transition-colors",
                "active:cursor-grabbing",
                isOver
                  ? cn(
                      position === "after"
                        ? "border-r-primary"
                        : "border-l-primary",
                      "bg-accent text-accent-foreground"
                    )
                  : "border-l-transparent border-r-transparent",
                dragged === column.key && "opacity-50"
              )}
              draggable
              key={column.key}
              onDragEnd={clearDrag}
              onDragOver={(event) => dragColumn(event, column.key)}
              onDragStart={(event) => startDrag(event, column.key)}
              onDrop={(event) => dropColumn(event, column.key)}
              title={t("project.dragColumn", { columnName: column.label })}
            >
              {column.hideHeaderText ? (
                <span className="sr-only">{column.label}</span>
              ) : (
                column.label
              )}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
});
