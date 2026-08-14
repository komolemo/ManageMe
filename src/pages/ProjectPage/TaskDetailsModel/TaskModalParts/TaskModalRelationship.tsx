import type { FormEventHandler, RefObject } from "react";

import type { ProjectTask } from "@/features/task/projectTypes";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/pages/ProjectPage/ModalTaskManager";

type TaskModalRelationshipProps = {
  canAddSubtask: boolean;
  canShowSubtasks: boolean;
  newSubtaskNameInputRef: RefObject<HTMLInputElement | null>;
  onAddSubtask: FormEventHandler<HTMLFormElement>;
  onRegisterExistingParentTask?: (
    taskId: ProjectTask["id"],
    parentTask: ProjectTask,
  ) => void;
  onRegisterExistingSubtask?: (
    parentTaskId: ProjectTask["id"],
    subtask: ProjectTask,
  ) => void;
  parentTask?: ProjectTask | null;
  projectTasks: ProjectTask[];
  subtasks: ProjectTask[];
  task: ProjectTask;
};

export function TaskModalRelationship({
  canAddSubtask,
  canShowSubtasks,
  newSubtaskNameInputRef,
  onAddSubtask,
  onRegisterExistingParentTask,
  onRegisterExistingSubtask,
  parentTask,
  projectTasks,
  subtasks,
  task,
}: TaskModalRelationshipProps) {
  const existingTasks = projectTasks.filter(
    (projectTask) => projectTask.id !== task.id,
  );

  return (
    <>
      <ParentTaskManager
        existingTasks={existingTasks}
        onRegisterExistingTask={(existingTask) =>
          onRegisterExistingParentTask?.(task.id, existingTask)
        }
        task={parentTask}
      />

      {canShowSubtasks ? (
        <SubTaskManager
          canAddTask={canAddSubtask}
          existingTasks={existingTasks}
          onAddTask={onAddSubtask}
          onRegisterExistingTask={(existingTask) =>
            onRegisterExistingSubtask?.(task.id, existingTask)
          }
          taskNameInputRef={newSubtaskNameInputRef}
          tasks={subtasks}
        />
      ) : null}
    </>
  );
}
