import { Link as LinkIcon } from "lucide-react";
import type { FormEventHandler, RefObject } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProjectTask } from "@/pages/projectData";

type SimpleTaskManagerProps = {
  canAddTask?: boolean;
  inputId?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  onAddTask?: FormEventHandler<HTMLFormElement>;
  taskNameInputRef?: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
  title: string;
};

type ParentTaskManagerProps = {
  task: ProjectTask;
};

type SubTaskManagerProps = {
  canAddTask?: boolean;
  onAddTask: FormEventHandler<HTMLFormElement>;
  taskNameInputRef: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
};

function SimpleTaskManager({
  canAddTask = false,
  inputId = "simple-task-manager-new-task",
  inputLabel = "Task name",
  inputPlaceholder = "Add task",
  onAddTask,
  taskNameInputRef,
  tasks,
  title,
}: SimpleTaskManagerProps) {
  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between">
        <div className="font-medium text-[14px]">{title}</div>
        <Button/>
      </div>
      <div className="divide-y grid gap-[4px]">
        {tasks.map((task) => (
          <div
            className="grid min-h-[24px] items-center gap-[8px] border-b pb-[4px]"
            key={task.id}
            style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
          >
            <Checkbox checked={task.isFinished} />
            <a
              className="flex min-w-0 items-center gap-[6px] text-[14px] text-foreground underline-offset-4 hover:underline"
              href={task.wikiPageLink}
            >
              <LinkIcon className="size-3 shrink-0 text-muted-foreground" />
              <span
                className="block min-w-0 max-w-full flex-1 whitespace-normal"
                style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
              >
                {task.subject}
              </span>
            </a>
          </div>
        ))}
        {canAddTask ? (
          <form
            className="grid min-h-[36px] items-center gap-[8px] border-0"
            onSubmit={onAddTask}
            style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
          >
            <Checkbox disabled />
            <label className="sr-only" htmlFor={inputId}>
              {inputLabel}
            </label>
            <Input
              className="h-[26px] border-0 px-[8px] py-[0px] focus-visible:ring-0"
              id={inputId}
              placeholder={inputPlaceholder}
              ref={taskNameInputRef}
            />
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function ParentTaskManager({ task }: ParentTaskManagerProps) {
  return <SimpleTaskManager tasks={[task]} title="Parent task" />;
}

export function SubTaskManager({
  canAddTask,
  onAddTask,
  taskNameInputRef,
  tasks,
}: SubTaskManagerProps) {
  return (
    <SimpleTaskManager
      canAddTask={canAddTask}
      inputId="issue-detail-new-subtask"
      inputLabel="Subtask name"
      inputPlaceholder="Add subtask"
      onAddTask={onAddTask}
      taskNameInputRef={taskNameInputRef}
      tasks={tasks}
      title="Subtasks"
    />
  );
}
