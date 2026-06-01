import type { ProjectTask } from "@/pages/projectData";
import type {
  ColumnDropPosition,
  GridColumnKey,
  ProjectGridTaskRow,
} from "@/components/ProjectGridView/types";

export function reorderColumns(
  columnOrder: GridColumnKey[],
  draggedColumnKey: GridColumnKey,
  targetColumnKey: GridColumnKey,
  dropPosition: ColumnDropPosition
) {
  if (draggedColumnKey === targetColumnKey) {
    return columnOrder;
  }

  const nextColumnOrder = columnOrder.filter(
    (columnKey) => columnKey !== draggedColumnKey
  );
  const targetIndex = nextColumnOrder.indexOf(targetColumnKey);

  if (targetIndex === -1) {
    return columnOrder;
  }

  nextColumnOrder.splice(
    dropPosition === "after" ? targetIndex + 1 : targetIndex,
    0,
    draggedColumnKey
  );

  return nextColumnOrder;
}

export function flattenTaskRows(
  tasks: ProjectTask[],
  expandedTaskIds: Set<string>,
  depth = 0
): ProjectGridTaskRow[] {
  return tasks.flatMap((task) => {
    const taskRow = { depth, task };

    if (!task.children?.length || !expandedTaskIds.has(task.id)) {
      return [taskRow];
    }

    return [
      taskRow,
      ...flattenTaskRows(task.children, expandedTaskIds, depth + 1),
    ];
  });
}
