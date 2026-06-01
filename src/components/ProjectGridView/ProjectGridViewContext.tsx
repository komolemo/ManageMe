import {
  createContext,
  useContext,
  type DragEvent,
  type ReactNode,
} from "react";
import type {
  ColumnDropPosition,
  GridColumnKey,
} from "@/components/ProjectGridView/types";

type ProjectGridViewContextValue = {
  columnDropPosition: ColumnDropPosition;
  dragOverColumnKey: GridColumnKey | null;
  draggedColumnKey: GridColumnKey | null;
  onColumnDragEnd: () => void;
  onColumnDragOver: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDragStart: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDrop: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
};

const ProjectGridViewContext =
  createContext<ProjectGridViewContextValue | null>(null);

export function ProjectGridViewProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ProjectGridViewContextValue;
}) {
  return (
    <ProjectGridViewContext.Provider value={value}>
      {children}
    </ProjectGridViewContext.Provider>
  );
}

export function useProjectGridViewContext() {
  const context = useContext(ProjectGridViewContext);

  if (!context) {
    throw new Error(
      "useProjectGridViewContext must be used inside ProjectGridViewProvider"
    );
  }

  return context;
}
