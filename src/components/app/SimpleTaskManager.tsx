import { ArrowRight, Plus, Search } from "lucide-react";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEventHandler,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  formatProjectTaskKey,
  type ProjectTask,
} from "@/pages/projectData";
import { cn } from "@/lib/utils";

type SimpleTaskManagerProps = {
  addExistingTaskLabel: string;
  existingTasks: ProjectTask[];
  canAddTask?: boolean;
  inputId?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  onAddTask?: FormEventHandler<HTMLFormElement>;
  onRegisterExistingTask: (task: ProjectTask) => void;
  taskNameInputRef?: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
  title: string;
};

type ParentTaskManagerProps = {
  existingTasks: ProjectTask[];
  onRegisterExistingTask: (task: ProjectTask) => void;
  task?: ProjectTask | null;
};

type SubTaskManagerProps = {
  canAddTask?: boolean;
  existingTasks: ProjectTask[];
  onAddTask: FormEventHandler<HTMLFormElement>;
  onRegisterExistingTask: (task: ProjectTask) => void;
  taskNameInputRef: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
};

function SimpleTaskManager({
  addExistingTaskLabel,
  canAddTask = false,
  existingTasks,
  inputId = "simple-task-manager-new-task",
  inputLabel = "Task name",
  inputPlaceholder = "Add task",
  onAddTask,
  onRegisterExistingTask,
  taskNameInputRef,
  tasks,
  title,
}: SimpleTaskManagerProps) {
  const [isExistingTaskSearchOpen, setIsExistingTaskSearchOpen] =
    useState(false);
  const [existingTaskSearchQuery, setExistingTaskSearchQuery] = useState("");
  const [suggestionPlacement, setSuggestionPlacement] = useState<
    "bottom" | "top"
  >("bottom");
  const [suggestionMaxHeight, setSuggestionMaxHeight] = useState<
    number | undefined
  >();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);
  const registeredTaskIds = useMemo(
    () => new Set(tasks.map((task) => task.id)),
    [tasks]
  );
  const existingTaskSuggestions = useMemo(() => {
    const normalizedQuery = existingTaskSearchQuery.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      return [];
    }

    return existingTasks
      .filter((task) => !registeredTaskIds.has(task.id))
      .filter((task) => {
        const taskId = String(task.id).toLowerCase();
        const taskName = task.subject.toLowerCase();

        return (
          taskId.includes(normalizedQuery) ||
          taskName.includes(normalizedQuery)
        );
      })
      .slice(0, 8);
  }, [existingTaskSearchQuery, existingTasks, registeredTaskIds]);

  useLayoutEffect(() => {
    if (!isExistingTaskSearchOpen || !existingTaskSuggestions.length) {
      setSuggestionPlacement("bottom");
      setSuggestionMaxHeight(undefined);
      return;
    }

    const updateSuggestionPlacement = () => {
      const searchContainer = searchContainerRef.current;
      const suggestionList = suggestionListRef.current;
      const dialogContent = searchContainer?.closest(
        '[data-slot="dialog-content"]'
      );

      if (!searchContainer || !suggestionList || !dialogContent) {
        return;
      }

      const gap = 4;
      const searchRect = searchContainer.getBoundingClientRect();
      const dialogRect = dialogContent.getBoundingClientRect();
      const spaceBelow = Math.max(0, dialogRect.bottom - searchRect.bottom - gap);
      const spaceAbove = Math.max(0, searchRect.top - dialogRect.top - gap);
      const nextPlacement =
        suggestionList.scrollHeight > spaceBelow ? "top" : "bottom";
      const availableSpace =
        nextPlacement === "top" ? spaceAbove : spaceBelow;

      setSuggestionPlacement(nextPlacement);
      setSuggestionMaxHeight(availableSpace || undefined);
    };

    updateSuggestionPlacement();

    const dialogContent = searchContainerRef.current?.closest(
      '[data-slot="dialog-content"]'
    );

    window.addEventListener("resize", updateSuggestionPlacement);
    dialogContent?.addEventListener("scroll", updateSuggestionPlacement);

    return () => {
      window.removeEventListener("resize", updateSuggestionPlacement);
      dialogContent?.removeEventListener("scroll", updateSuggestionPlacement);
    };
  }, [existingTaskSuggestions.length, isExistingTaskSearchOpen]);

  const closeExistingTaskSearch = () => {
    setIsExistingTaskSearchOpen(false);
    setExistingTaskSearchQuery("");
  };

  return (
    <div className="grid gap-[6px]">
      <div className="flex justify-between gap-[8px]">
        <div className="font-medium text-[14px]">{title}</div>
        {isExistingTaskSearchOpen ? (
          <div
            className="relative grid h-[28px] w-[240px] gap-[4px] rounded-full border-2 border-forground bg-border/40"
            ref={searchContainerRef}
          >
            <div className="flex items-center justify-between gap-[4px]">
              <Button
                aria-label="Back to add existing task"
                className="w-[26px] rounded-full bg-transparent ml-[4px] px-[0px] py-[0px]"
                onClick={closeExistingTaskSearch}
                type="button"
                variant="ghost"
              >
                <ArrowRight className="size-3.5 text-forground" />
              </Button>
              <Input
                aria-label="Existing task search"
                className="h-[20px] border-0 bg-border/40 px-[8px] py-0 pr-[26px] focus-visible:border-ring focus-visible:ring-0"
                onChange={(event) =>
                  setExistingTaskSearchQuery(event.target.value)
                }
                placeholder="task name or task ID"
                value={existingTaskSearchQuery}
              />
              <Search
                aria-hidden
                className="bg-transparent text-muted-foreground mr-[8px]"
              />
            </div>
            {existingTaskSuggestions.length ? (
              <div
                className={cn(
                  "absolute z-50 grid gap-[2px] overflow-y-auto border bg-background p-[4px]",
                  suggestionPlacement === "top"
                    ? "bottom-[calc(100%+4px)]"
                    : "top-[calc(100%+4px)]"
                )}
                ref={suggestionListRef}
                style={{ maxHeight: suggestionMaxHeight }}
              >
                {existingTaskSuggestions.map((task) => (
                  <button
                    className="grid min-w-0 gap-[2px] border bg-background px-[6px] py-[4px] text-left text-xs hover:bg-accent"
                    key={task.id}
                    onClick={() => {
                      onRegisterExistingTask(task);
                      closeExistingTaskSearch();
                    }}
                    type="button"
                  >
                    <span className="truncate font-medium">
                      {formatProjectTaskKey(task.id)}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {task.subject}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <Button
            className="h-[32px] rounded-full border-forground border-2 bg-border/40 pl-[4px] pr-[8px] py-0 text-xs"
            onClick={() => setIsExistingTaskSearchOpen(true)}
            type="button"
            variant="ghost"
          >
            <Plus className="size-3" />
            {addExistingTaskLabel}
          </Button>
        )}
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
              className="flex min-w-0 items-center gap-[6px] text-[14px] text-foreground no-underline underline-offset-4 hover:underline"
              href={task.wikiPageLink}
            >
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

export function ParentTaskManager({
  existingTasks,
  onRegisterExistingTask,
  task,
}: ParentTaskManagerProps) {
  return (
    <SimpleTaskManager
      addExistingTaskLabel="Select a task"
      existingTasks={existingTasks}
      onRegisterExistingTask={onRegisterExistingTask}
      tasks={task ? [task] : []}
      title="Parent task"
    />
  );
}

export function SubTaskManager({
  canAddTask,
  existingTasks,
  onAddTask,
  onRegisterExistingTask,
  taskNameInputRef,
  tasks,
}: SubTaskManagerProps) {
  return (
    <SimpleTaskManager
      addExistingTaskLabel="Select a task"
      canAddTask={canAddTask}
      existingTasks={existingTasks}
      inputId="issue-detail-new-subtask"
      inputLabel="Subtask name"
      inputPlaceholder="Add subtask"
      onAddTask={onAddTask}
      onRegisterExistingTask={onRegisterExistingTask}
      taskNameInputRef={taskNameInputRef}
      tasks={tasks}
      title="Subtasks"
    />
  );
}
