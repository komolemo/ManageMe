import type { ProjectTask } from "@/features/task/projectTypes";
import type { ProjectTableColumn } from "../ProjectTable";

type DefaultCellProps = {
  column: ProjectTableColumn;
  task: ProjectTask;
};

export function DefaultCell({ column, task }: DefaultCellProps) {
  return column.render
    ? column.render(task)
    : String(task[column.key as keyof ProjectTask]);
}
