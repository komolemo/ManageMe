import {
  memo,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import type { DueDatePopup } from "@/components/app/TaskParameters";
import { DefaultCell } from "@/pages/ProjectGridView/DefaultCell";
import { DueDateCell } from "@/pages/ProjectGridView/DueDateCell";
import { FinishedCell } from "@/pages/ProjectGridView/FinishedCell";
import { PriorityCell } from "@/pages/ProjectGridView/PriorityCell";
import { ProjectGridCell } from "@/pages/ProjectGridView/ProjectGridCell";
import { StatusCell } from "@/pages/ProjectGridView/StatusCell";
import { SubjectCell } from "@/pages/ProjectGridView/SubjectCell";
import type { GridColumn } from "@/pages/ProjectGridView/types";
import type { ProjectTask, TaskStatus } from "@/pages/projectData";

const rowBackgroundClassNames = [
  "bg-[oklch(0.94_0_0)] dark:bg-[oklch(0.205_0_0)]",
  "bg-[oklch(0.965_0_0)] dark:bg-[oklch(0.265_0_0)]",
  "bg-[oklch(0.985_0_0)] dark:bg-[oklch(0.335_0_0)]",
];

export type ProjectGridRowProps = {
  calendarRef: RefObject<HTMLDivElement | null>;
  depth: number;
  dueDate: string;
  dueDateInput: string;
  dueDateInputError: string;
  dueDateInputRef: RefObject<HTMLInputElement | null>;
  dueDatePopup: DueDatePopup | null;
  gridTemplateColumns: string;
  isCalendarOpen: boolean;
  isExpanded: boolean;
  isFinished: boolean;
  isPriorityOpen: boolean;
  isStatusOpen: boolean;
  isTextInputOpen: boolean;
  onChangeDueDateInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onDueDateInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    taskId: string
  ) => void;
  onFinishedChange: (taskId: string, isFinished: boolean) => void;
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
  orderedColumns: GridColumn[];
  priority: ProjectTask["priority"];
  status: TaskStatus;
  task: ProjectTask;
};

export const ProjectGridRow = memo(function ProjectGridRow({
  calendarRef,
  depth,
  dueDate,
  dueDateInput,
  dueDateInputError,
  dueDateInputRef,
  dueDatePopup,
  gridTemplateColumns,
  isCalendarOpen,
  isExpanded,
  isFinished,
  isPriorityOpen,
  isStatusOpen,
  isTextInputOpen,
  onChangeDueDateInput,
  onDueDateInputKeyDown,
  onFinishedChange,
  onOpenDueDateCalendar,
  onOpenDueDatePopup,
  onPriorityOpenChange,
  onSaveDueDateInput,
  onSelectDueDate,
  onSelectPriority,
  onSelectStatus,
  onStatusOpenChange,
  onToggleTaskExpansion,
  orderedColumns,
  priority,
  status,
  task,
}: ProjectGridRowProps) {
  const rowBackgroundClassName =
    rowBackgroundClassNames[Math.min(depth, rowBackgroundClassNames.length - 1)];

  return (
    <div
      className={`grid border-b text-xs transition-colors last:border-b-0 hover:bg-accent hover:text-accent-foreground ${rowBackgroundClassName}`}
      style={{ gridTemplateColumns }}
    >
      {orderedColumns.map((column) => {
        if (column.key === "isFinished") {
          return (
            <ProjectGridCell key={column.key}>
              <FinishedCell
                hasChildTasks={Boolean(task.children?.length)}
                isExpanded={isExpanded}
                isFinished={isFinished}
                onFinishedChange={onFinishedChange}
                onToggleTaskExpansion={onToggleTaskExpansion}
                taskId={task.id}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "status") {
          return (
            <ProjectGridCell
              key={column.key}
              onDoubleClick={() => onStatusOpenChange(task.id, true)}
            >
              <StatusCell
                isOpen={isStatusOpen}
                onOpenChange={(isOpen) => onStatusOpenChange(task.id, isOpen)}
                onSelectStatus={(value) => onSelectStatus(task.id, value)}
                status={status}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "priority") {
          return (
            <ProjectGridCell
              key={column.key}
              onDoubleClick={() => onPriorityOpenChange(task.id, true)}
            >
              <PriorityCell
                isOpen={isPriorityOpen}
                onOpenChange={(isOpen) => onPriorityOpenChange(task.id, isOpen)}
                onSelectPriority={(value) => onSelectPriority(task.id, value)}
                priority={priority}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "dueDate") {
          return (
            <ProjectGridCell
              key={column.key}
              onDoubleClick={(event) =>
                onOpenDueDatePopup(
                  task,
                  event.currentTarget.getBoundingClientRect(),
                  "calendar"
                )
              }
            >
              <DueDateCell
                calendarRef={calendarRef}
                dueDate={dueDate}
                dueDateInput={dueDateInput}
                dueDateInputError={dueDateInputError}
                dueDateInputRef={dueDateInputRef}
                isCalendarOpen={isCalendarOpen}
                isTextInputOpen={isTextInputOpen}
                onChangeDueDateInput={onChangeDueDateInput}
                onDueDateInputKeyDown={(event) =>
                  onDueDateInputKeyDown(event, task.id)
                }
                onOpenDueDateCalendar={(button) =>
                  onOpenDueDateCalendar(task, button)
                }
                onSaveDueDateInput={() => onSaveDueDateInput(task.id)}
                onSelectDueDate={(date) => onSelectDueDate(task.id, date)}
                popup={dueDatePopup}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "subject") {
          return (
            <ProjectGridCell className="overflow-hidden" key={column.key}>
              <SubjectCell
                depth={depth}
                isFinished={isFinished}
                subject={task.subject}
              />
            </ProjectGridCell>
          );
        }

        return (
          <ProjectGridCell key={column.key}>
            <DefaultCell column={column} task={task} />
          </ProjectGridCell>
        );
      })}
    </div>
  );
}, areProjectGridRowPropsEqual);

function areProjectGridRowPropsEqual(
  previousProps: ProjectGridRowProps,
  nextProps: ProjectGridRowProps
) {
  return (
    previousProps.task === nextProps.task &&
    previousProps.depth === nextProps.depth &&
    previousProps.dueDate === nextProps.dueDate &&
    previousProps.dueDateInput === nextProps.dueDateInput &&
    previousProps.dueDateInputError === nextProps.dueDateInputError &&
    previousProps.dueDatePopup === nextProps.dueDatePopup &&
    previousProps.gridTemplateColumns === nextProps.gridTemplateColumns &&
    previousProps.isCalendarOpen === nextProps.isCalendarOpen &&
    previousProps.isExpanded === nextProps.isExpanded &&
    previousProps.isFinished === nextProps.isFinished &&
    previousProps.isPriorityOpen === nextProps.isPriorityOpen &&
    previousProps.isStatusOpen === nextProps.isStatusOpen &&
    previousProps.isTextInputOpen === nextProps.isTextInputOpen &&
    previousProps.orderedColumns === nextProps.orderedColumns &&
    previousProps.priority === nextProps.priority &&
    previousProps.status === nextProps.status
  );
}
