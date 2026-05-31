import {
  createContext,
  useContext,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { DueDatePopup } from "@/components/app/TaskParameters";
import type {
  ColumnDropPosition,
  GridColumnKey,
} from "@/components/ProjectGridView/types";
import type { ProjectTask, TaskStatus } from "@/pages/projectData";

type ProjectGridViewContextValue = {
  calendarRef: RefObject<HTMLDivElement | null>;
  columnDropPosition: ColumnDropPosition;
  dragOverColumnKey: GridColumnKey | null;
  draggedColumnKey: GridColumnKey | null;
  dueDateInput: string;
  dueDateInputError: string;
  dueDateInputRef: RefObject<HTMLInputElement | null>;
  dueDatePopup: DueDatePopup | null;
  editedDueDates: Record<string, string>;
  editedPriorities: Record<string, ProjectTask["priority"]>;
  editedStatuses: Record<string, TaskStatus>;
  expandedTaskIds: Set<string>;
  onChangeDueDateInput: (event: ChangeEvent<HTMLInputElement>) => void;
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
  onDueDateInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    taskId: string
  ) => void;
  onOpenDueDateCalendar: (task: ProjectTask, button: HTMLButtonElement) => void;
  onOpenDueDatePopup: (
    task: ProjectTask,
    rect: DOMRect,
    mode: DueDatePopup["mode"]
  ) => void;
  onPriorityOpenChange: (taskId: string, isOpen: boolean) => void;
  onSaveDueDateInput: (taskId: string) => void;
  onSelectDueDate: (taskId: string, date?: Date) => void;
  onSelectPriority: (taskId: string, priority: string) => void;
  onSelectStatus: (taskId: string, status: string) => void;
  onStatusOpenChange: (taskId: string, isOpen: boolean) => void;
  onToggleTaskExpansion: (taskId: string) => void;
  openPriorityMenuTaskId: string | null;
  openStatusMenuTaskId: string | null;
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
