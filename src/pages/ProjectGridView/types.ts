import type { ReactNode } from "react";
import type { ProjectTask } from "@/pages/projectData";

export type GridColumn = {
  key: keyof ProjectTask;
  label: string;
  minWidth: number;
  width: string;
  hideHeaderText?: boolean;
  render?: (task: ProjectTask) => ReactNode;
};

export type GridColumnKey = GridColumn["key"];
export type ColumnDropPosition = "before" | "after";

export type ProjectGridTaskRow = {
  depth: number;
  task: ProjectTask;
};
