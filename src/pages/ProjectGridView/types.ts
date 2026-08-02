import type { ReactNode } from "react";
import type { ProjectTask } from "@/features/task/projectTypes";

export type GridColumnKey = keyof ProjectTask | "taskKey";

export type GridColumn = {
  key: GridColumnKey;
  label: string;
  minWidth: number;
  width: string;
  hideHeaderText?: boolean;
  render?: (task: ProjectTask) => ReactNode;
};

export type ColumnDropPosition = "before" | "after";

export type ProjectGridTaskRow = {
  depth: number;
  task: ProjectTask;
};
