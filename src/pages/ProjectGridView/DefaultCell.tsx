import { memo } from "react";
import type { ProjectTask } from "@/features/task/projectTypes";
import type { GridColumn } from "@/pages/ProjectGridView/types";

export const DefaultCell = memo(function DefaultCell({
  column,
  task,
}: {
  column: GridColumn;
  task: ProjectTask;
}) {
  return column.render
    ? column.render(task)
    : String(task[column.key as keyof ProjectTask]);
});
