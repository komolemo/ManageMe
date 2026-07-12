import { ArrowRight, Plus, Search, Trash2, Unlink } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { formatProjectTaskKey, type ProjectTask } from "@/pages/projectData";

export type TaskListProps = {
  canAddTask?: boolean;
  inputId?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  onAddTask?: FormEventHandler<HTMLFormElement>;
  onOpenTaskDetails?: (task: ProjectTask) => void;
  onOpenTaskInNewTab?: (task: ProjectTask) => void;
  taskNameInputRef?: RefObject<HTMLInputElement | null>;
  tasks: ProjectTask[];
};

type TaskSelectionButtonProps = {
  addExistingTaskLabel: string;
  existingTasks: ProjectTask[];
  onRegisterExistingTask: (task: ProjectTask) => void;
  registeredTasks: ProjectTask[];
};

export type ParentTaskSelectionButtonProps = Omit<
  TaskSelectionButtonProps,
  "addExistingTaskLabel"
>;

export type ChildTaskSelectionButtonProps = ParentTaskSelectionButtonProps;

export function TaskList({
  canAddTask = false,
  inputId = "simple-task-manager-new-task",
  inputLabel = "Task name",
  inputPlaceholder = "Add task",
  onAddTask,
  onOpenTaskDetails,
  onOpenTaskInNewTab,
  taskNameInputRef,
  tasks,
}: TaskListProps) {
  return (
    <div className="divide-y grid gap-[4px]">
      {tasks.map((task) => (
        <div
          className="grid min-h-[24px] items-center gap-[8px] border-b pb-[4px] pr-[4px]"
          key={task.id}
          style={{ gridTemplateColumns: "20px minmax(0, 1fr) auto" }}
        >
          <Checkbox checked={task.isFinished} />
          {onOpenTaskDetails ? (
            <button
              className="flex min-w-0 items-center gap-[6px] border-0 bg-transparent p-0 text-left text-[14px] text-foreground underline-offset-4 hover:underline"
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault();
                }
              }}
              onClick={() => onOpenTaskDetails(task)}
              onMouseDown={(event) => {
                if (event.button !== 1 || !onOpenTaskInNewTab) {
                  return;
                }

                event.preventDefault();
                onOpenTaskInNewTab(task);
              }}
              type="button"
            >
              <span
                className="block min-w-0 max-w-full flex-1 whitespace-normal"
                style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
              >
                {task.subject}
              </span>
            </button>
          ) : (
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
          )}
          <div className="flex items-center gap-[12px]">
            <Unlink className="size-5 text-muted-foreground hover:text-foreground" />
            <Trash2 className="size-5 text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      ))}
      {canAddTask ? (
        <form
          className="grid min-h-[36px] mr-[16px] items-center gap-[8px] border-0"
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
  );
}

export function ParentTaskSelectionButton(
  props: ParentTaskSelectionButtonProps,
) {
  return <TaskSelectionButton addExistingTaskLabel="Select a task" {...props} />;
}

export function ChildTaskSelectionButton(props: ChildTaskSelectionButtonProps) {
  return <TaskSelectionButton addExistingTaskLabel="Select a task" {...props} />;
}

function TaskSelectionButton({
  addExistingTaskLabel,
  existingTasks,
  onRegisterExistingTask,
  registeredTasks,
}: TaskSelectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [maxHeight, setMaxHeight] = useState<number>();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);
  const registeredTaskIds = useMemo(
    () => new Set(registeredTasks.map((task) => task.id)),
    [registeredTasks],
  );
  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      return [];
    }

    return existingTasks
      .filter((task) => !registeredTaskIds.has(task.id))
      .filter((task) =>
        `${task.id} ${task.subject}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [existingTasks, query, registeredTaskIds]);

  useLayoutEffect(() => {
    if (!isOpen || !suggestions.length) {
      setPlacement("bottom");
      setMaxHeight(undefined);
      return;
    }

    const updatePlacement = () => {
      const searchContainer = searchContainerRef.current;
      const suggestionList = suggestionListRef.current;
      const dialogContent = searchContainer?.closest(
        '[data-slot="dialog-content"]',
      );

      if (!searchContainer || !suggestionList || !dialogContent) {
        return;
      }

      const gap = 4;
      const searchRect = searchContainer.getBoundingClientRect();
      const dialogRect = dialogContent.getBoundingClientRect();
      const spaceBelow = Math.max(0, dialogRect.bottom - searchRect.bottom - gap);
      const spaceAbove = Math.max(0, searchRect.top - dialogRect.top - gap);
      const nextPlacement = suggestionList.scrollHeight > spaceBelow ? "top" : "bottom";

      setPlacement(nextPlacement);
      setMaxHeight(
        (nextPlacement === "top" ? spaceAbove : spaceBelow) || undefined,
      );
    };

    updatePlacement();
    const dialogContent = searchContainerRef.current?.closest(
      '[data-slot="dialog-content"]',
    );
    window.addEventListener("resize", updatePlacement);
    dialogContent?.addEventListener("scroll", updatePlacement);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      dialogContent?.removeEventListener("scroll", updatePlacement);
    };
  }, [isOpen, suggestions.length]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <Button
        className="h-[28px] gap-[4px] rounded-full border-forground border-2 bg-border/40 pl-[4px] pr-[8px] py-[0px] text-xs"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="ghost"
      >
        <Plus className="size-[18px]" />
        {addExistingTaskLabel}
      </Button>
    );
  }

  return (
    <div
      className="relative grid h-[26px] w-[240px] gap-[4px] rounded-full border-1 border-forground bg-border/40"
      ref={searchContainerRef}
    >
      <div className="flex items-center justify-between gap-[4px]">
        <Button
          aria-label="Back to add existing task"
          className="w-[26px] rounded-full bg-transparent ml-[4px] px-[0px] py-[0px]"
          onClick={close}
          type="button"
          variant="ghost"
        >
          <ArrowRight className="size-3.5 text-forground" />
        </Button>
        <Input
          aria-label="Existing task search"
          className="h-[20px] border-0 bg-border/40 px-[8px] py-0 pr-[26px] focus-visible:border-ring focus-visible:ring-0"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="task name or task ID"
          value={query}
        />
        <Search aria-hidden className="bg-transparent text-muted-foreground mr-[8px]" />
      </div>
      {suggestions.length ? (
        <div
          className={cn(
            "absolute left-[12px] z-50 border bg-background p-[4px]",
            placement === "top" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]",
          )}
          ref={suggestionListRef}
          style={{ maxHeight }}
        >
          <div className="max-h-[240px] gap-[2px] overflow-y-auto grid">
            {suggestions.map((task) => (
              <button
                className="grid min-w-[180px] gap-[2px] border-0 px-[6px] py-[4px] bg-sidebar text-left text-xs hover:bg-accent"
                key={task.id}
                onClick={() => {
                  onRegisterExistingTask(task);
                  close();
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
        </div>
      ) : null}
    </div>
  );
}
