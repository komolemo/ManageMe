import { memo, type RefObject, type WheelEvent } from "react";
import { useProjectGridViewContext } from "@/pages/ProjectGridView/ProjectGridViewContext";
import type { GridColumn } from "@/pages/ProjectGridView/types";
import { useTranslation } from "react-i18next";

type ProjectGridHeaderProps = {
  gridMinWidth: number;
  gridTemplateColumns: string;
  headerScrollRef: RefObject<HTMLDivElement | null>;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
  orderedColumns: GridColumn[];
  scrollbarGutterWidth: number;
};

export const ProjectGridHeader = memo(function ProjectGridHeader({
  gridMinWidth,
  gridTemplateColumns,
  headerScrollRef,
  onWheel,
  orderedColumns,
  scrollbarGutterWidth,
}: ProjectGridHeaderProps) {
  return (
    <div
      className="box-border shrink-0 overflow-hidden"
      onWheel={onWheel}
      ref={headerScrollRef}
      style={{ paddingRight: `${scrollbarGutterWidth}px` }}
    >
      <div style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}>
        <div
          className="grid border-b bg-muted text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
          {orderedColumns.map((column) => (
            <ProjectGridHeaderCell
              column={column}
              key={column.key}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

type ProjectGridHeaderCellProps = {
  column: GridColumn;
};

function ProjectGridHeaderCell({ column }: ProjectGridHeaderCellProps) {
  const { t } = useTranslation();
  const {
    columnDropPosition,
    dragOverColumnKey,
    draggedColumnKey,
    onColumnDragEnd,
    onColumnDragOver,
    onColumnDragStart,
    onColumnDrop,
  } = useProjectGridViewContext();
  const isDraggedColumn = draggedColumnKey === column.key;
  const isDragOverColumn =
    dragOverColumnKey === column.key && draggedColumnKey !== column.key;
  const dragOverBorderClass =
    columnDropPosition === "after" ? "border-r-primary" : "border-l-primary";

  return (
    <div
      aria-label={t("project.moveColumn", { columnName: column.label })}
      className={`min-w-0 cursor-grab select-none whitespace-nowrap border-l-2 border-r-2 px-[8px] py-[4px] transition-colors active:cursor-grabbing ${
        isDragOverColumn
          ? `${dragOverBorderClass} bg-accent text-accent-foreground`
          : "border-l-transparent border-r-transparent"
      } ${isDraggedColumn ? "opacity-50" : ""}`}
      draggable
      onDragEnd={onColumnDragEnd}
      onDragOver={(event) => onColumnDragOver(event, column.key)}
      onDragStart={(event) => onColumnDragStart(event, column.key)}
      onDrop={(event) => onColumnDrop(event, column.key)}
      role="button"
      tabIndex={0}
      title={t("project.dragColumn", { columnName: column.label })}
    >
      {column.hideHeaderText ? (
        <span className="sr-only">{column.label}</span>
      ) : (
        column.label
      )}
    </div>
  );
}
