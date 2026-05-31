import { memo } from "react";
import { DefaultCell } from "@/components/ProjectGridView/DefaultCell";
import { DueDateCell } from "@/components/ProjectGridView/DueDateCell";
import { FinishedCell } from "@/components/ProjectGridView/FinishedCell";
import { PriorityCell } from "@/components/ProjectGridView/PriorityCell";
import { ProjectGridCell } from "@/components/ProjectGridView/ProjectGridCell";
import { useProjectGridViewContext } from "@/components/ProjectGridView/ProjectGridViewContext";
import { StatusCell } from "@/components/ProjectGridView/StatusCell";
import { SubjectCell } from "@/components/ProjectGridView/SubjectCell";
import type { GridColumn } from "@/components/ProjectGridView/types";
import type { ProjectTask } from "@/pages/projectData";

export type ProjectGridRowProps = {
  depth: number;
  gridTemplateColumns: string;
  orderedColumns: GridColumn[];
  task: ProjectTask;
};

export const ProjectGridRow = memo(function ProjectGridRow({
  depth,
  gridTemplateColumns,
  orderedColumns,
  task,
}: ProjectGridRowProps) {
  const {
    calendarRef,
    dueDateInput,
    dueDateInputError,
    dueDateInputRef,
    dueDatePopup,
    editedDueDates,
    editedPriorities,
    editedStatuses,
    expandedTaskIds,
    onChangeDueDateInput,
    onDueDateInputKeyDown,
    onOpenDueDateCalendar,
    onOpenDueDatePopup,
    onPriorityOpenChange,
    onSaveDueDateInput,
    onSelectDueDate,
    onSelectPriority,
    onSelectStatus,
    onStatusOpenChange,
    onToggleTaskExpansion,
    openPriorityMenuTaskId,
    openStatusMenuTaskId,
  } = useProjectGridViewContext();
  const dueDate = (editedDueDates[task.id] ?? task.dueDate).replace(/-/g, "/");
  const isActiveDueDateCell = dueDatePopup?.taskId === task.id;
  const isCalendarOpen =
    isActiveDueDateCell && dueDatePopup.mode === "calendar";
  const isTextInputOpen = isActiveDueDateCell && dueDatePopup.mode === "text";
  const priority = editedPriorities[task.id] ?? task.priority;
  const status = editedStatuses[task.id] ?? task.status;

  return (
    <div
      className="grid border-b text-xs last:border-b-0 hover:bg-accent hover:text-accent-foreground"
      style={{ gridTemplateColumns }}
    >
      {orderedColumns.map((column) => {
        if (column.key === "isFinished") {
          return (
            <ProjectGridCell key={column.key}>
              <FinishedCell
                depth={depth}
                hasChildTasks={Boolean(task.children?.length)}
                isExpanded={expandedTaskIds.has(task.id)}
                isFinished={task.isFinished}
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
                isOpen={openStatusMenuTaskId === task.id}
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
                isOpen={openPriorityMenuTaskId === task.id}
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
                popup={isActiveDueDateCell ? dueDatePopup : null}
              />
            </ProjectGridCell>
          );
        }

        if (column.key === "subject") {
          return (
            <ProjectGridCell key={column.key}>
              <SubjectCell subject={task.subject} />
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
    previousProps.gridTemplateColumns === nextProps.gridTemplateColumns &&
    previousProps.orderedColumns === nextProps.orderedColumns
  );
}
