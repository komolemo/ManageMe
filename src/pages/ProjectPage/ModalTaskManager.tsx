import type { FormEventHandler, ReactNode, RefObject } from "react";
import {
  ParentTaskSelectionButton,
  ChildTaskSelectionButton,
  TaskList,
} from "@/components/app/SimpleTaskManager";
import type { ProjectTask } from "@/pages/projectData";

type ParentTaskManagerProps = {
  existingTasks: ProjectTask[];
  onRegisterExistingTask: (task: ProjectTask) => void;
  onOpenTaskDetails?: (task: ProjectTask) => void;
  onOpenTaskInNewTab?: (task: ProjectTask) => void;
  task?: ProjectTask | null;
};

type SubTaskManagerProps = {
  canAddTask?: boolean;
  existingTasks: ProjectTask[];
  onAddTask: FormEventHandler<HTMLFormElement>;
  onRegisterExistingTask: (task: ProjectTask) => void;
  onOpenTaskDetails?: (task: ProjectTask) => void;
  onOpenTaskInNewTab?: (task: ProjectTask) => void;
  taskNameInputRef: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
  titleActions?: ReactNode;
};

export function ParentTaskManager({
  existingTasks,
  onRegisterExistingTask,
  onOpenTaskDetails,
  onOpenTaskInNewTab,
  task,
}: ParentTaskManagerProps) {
  const tasks = task ? [task] : [];

  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between items-center gap-[8px]">
        <div className="font-medium text-[14px]">Parent task</div>
        <ParentTaskSelectionButton
          existingTasks={existingTasks}
          onRegisterExistingTask={onRegisterExistingTask}
          registeredTasks={tasks}
        />
      </div>
      <TaskList
        onOpenTaskDetails={onOpenTaskDetails}
        onOpenTaskInNewTab={onOpenTaskInNewTab}
        tasks={tasks}
      />
    </div>
  );
}

export function SubTaskManager({
  canAddTask,
  existingTasks,
  onAddTask,
  onRegisterExistingTask,
  onOpenTaskDetails,
  onOpenTaskInNewTab,
  taskNameInputRef,
  tasks,
  titleActions,
}: SubTaskManagerProps) {
  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between items-center gap-[8px]">
        <div className="flex items-center gap-1">
          <div className="font-medium text-[14px]">Subtasks</div>
          {titleActions}
        </div>
        <ChildTaskSelectionButton
          existingTasks={existingTasks}
          onRegisterExistingTask={onRegisterExistingTask}
          registeredTasks={tasks}
        />
      </div>
      <TaskList
        canAddTask={canAddTask}
        inputId="issue-detail-new-subtask"
        inputLabel="Subtask name"
        inputPlaceholder="Add subtask"
        onAddTask={onAddTask}
        onOpenTaskDetails={onOpenTaskDetails}
        onOpenTaskInNewTab={onOpenTaskInNewTab}
        taskNameInputRef={taskNameInputRef}
        tasks={tasks}
      />
    </div>
  );
}
