import { memo } from "react";
import type { DueDatePopup } from "@/components/app/TaskParameters";
import { DefaultCell } from "@/pages/ProjectGridView/DefaultCell";
import { DueDateCell } from "@/pages/ProjectGridView/DueDateCell";
import { FinishedCell } from "@/pages/ProjectGridView/FinishedCell";
import { PriorityCell } from "@/pages/ProjectGridView/PriorityCell";
import { ProjectGridCell } from "@/pages/ProjectGridView/ProjectGridCell";
import { StatusCell } from "@/pages/ProjectGridView/StatusCell";
import { SubjectCell } from "@/pages/ProjectGridView/SubjectCell";
import { TaskKeyCell } from "@/pages/ProjectGridView/TaskKeyCell";
import type { GridColumn } from "@/pages/ProjectGridView/types";
import type { BucketName, ProjectTask } from "@/features/task/projectTypes";

const rowBackgroundClassNames = [
  "bg-[oklch(0.94_0_0)] dark:bg-[oklch(0.205_0_0)]",
  "bg-[oklch(0.965_0_0)] dark:bg-[oklch(0.265_0_0)]",
  "bg-[oklch(0.985_0_0)] dark:bg-[oklch(0.335_0_0)]",
];

export type ProjectGridRowProps = {
  bucketNames: string[];
  depth: number;
  dueDate: string;
  dueDatePopup: DueDatePopup | null;
  gridTemplateColumns: string;
  isExpanded: boolean;
  isFinished: boolean;
  isPriorityOpen: boolean;
  isStatusOpen: boolean;
  onDueDateClose: () => void;
  onDueDateCommit: (taskId: ProjectTask["id"], date: string) => void;
  onFinishedChange: (taskId: ProjectTask["id"], isFinished: boolean) => void;
  onOpenDueDatePopup: (
    task: ProjectTask,
    rect: DOMRect,
    mode: DueDatePopup["mode"]
  ) => void;
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  onOpenTaskDetails: (task: ProjectTask) => void;
  onPriorityOpenChange: (taskId: ProjectTask["id"], isOpen: boolean) => void;
  onSelectPriority: (taskId: ProjectTask["id"], priority: string) => void;
  onSelectStatus: (taskId: ProjectTask["id"], status: string) => void;
  onStatusOpenChange: (taskId: ProjectTask["id"], isOpen: boolean) => void;
  onToggleTaskExpansion: (taskId: ProjectTask["id"]) => void;
  orderedColumns: GridColumn[];
  priority: ProjectTask["priority"];
  status: BucketName;
  task: ProjectTask;
};

export const ProjectGridRow = memo(function ProjectGridRow({
  bucketNames,
  depth,
  dueDate,
  dueDatePopup,
  gridTemplateColumns,
  isExpanded,
  isFinished,
  isPriorityOpen,
  isStatusOpen,
  onDueDateClose,
  onDueDateCommit,
  onFinishedChange,
  onOpenDueDatePopup,
  onOpenTaskInNewTab,
  onOpenTaskDetails,
  onPriorityOpenChange,
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
                bucketNames={bucketNames}
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
                isActive={dueDatePopup?.taskId === task.id}
                onClose={onDueDateClose}
                onCommit={(date) => onDueDateCommit(task.id, date)}
                onOpen={(rect, mode) =>
                  onOpenDueDatePopup(task, rect, mode)
                }
                popup={dueDatePopup}
                value={dueDate}
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
                onOpenTaskInNewTab={() => onOpenTaskInNewTab(task)}
                onOpenTaskDetails={() => onOpenTaskDetails(task)}
                subject={task.subject}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "taskKey") {
          return (
            <ProjectGridCell className="overflow-hidden" key={column.key}>
              <TaskKeyCell
                isFinished={isFinished}
                taskId={task.id}
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
    previousProps.dueDatePopup === nextProps.dueDatePopup &&
    previousProps.gridTemplateColumns === nextProps.gridTemplateColumns &&
    previousProps.isExpanded === nextProps.isExpanded &&
    previousProps.isFinished === nextProps.isFinished &&
    previousProps.isPriorityOpen === nextProps.isPriorityOpen &&
    previousProps.isStatusOpen === nextProps.isStatusOpen &&
    previousProps.orderedColumns === nextProps.orderedColumns &&
    previousProps.priority === nextProps.priority &&
    previousProps.status === nextProps.status
  );
}
