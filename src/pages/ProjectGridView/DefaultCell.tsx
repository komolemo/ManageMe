import { memo } from "react";
import type { ProjectTask } from "@/pages/projectData";
import type { GridColumn } from "@/pages/ProjectGridView/types";

export const DefaultCell = memo(function DefaultCell({
  column,
  task,
}: {
  column: GridColumn;
  task: ProjectTask;
}) {
  return column.render ? column.render(task) : String(task[column.key]);
});
