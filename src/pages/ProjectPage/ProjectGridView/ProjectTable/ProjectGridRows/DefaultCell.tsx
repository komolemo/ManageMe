import type { ProjectTask } from "@/features/task/projectTypes";
import type { ProjectTableColumn } from "../ProjectTable";

export function DefaultCell({ column, task }: { column: ProjectTableColumn; task: ProjectTask }) {
  return column.render ? column.render(task) : String(task[column.key as keyof ProjectTask]);
}
