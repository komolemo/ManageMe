import type { FormEventHandler, ReactNode, RefObject } from "react";
import {
  ParentTaskSelectionButton,
  ChildTaskSelectionButton,
  TaskList,
} from "@/components/app/SimpleTaskManager";
import type { ProjectTask } from "@/pages/projectData";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const tasks = task ? [task] : [];

  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between items-center gap-[8px]">
        <div className="font-medium text-[14px]">{t("task.parentTask")}</div>
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
  const { t } = useTranslation();
  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between items-center gap-[8px]">
        <div className="flex items-center gap-1">
          <div className="font-medium text-[14px]">{t("task.subtasks")}</div>
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
        inputLabel={t("task.subtaskName")}
        inputPlaceholder={t("task.addSubtask")}
        onAddTask={onAddTask}
        onOpenTaskDetails={onOpenTaskDetails}
        onOpenTaskInNewTab={onOpenTaskInNewTab}
        taskNameInputRef={taskNameInputRef}
        tasks={tasks}
      />
    </div>
  );
}
