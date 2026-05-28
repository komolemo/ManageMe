import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  formatCalendarDate,
  TaskDueDateParameter,
  TaskPriorityParameter,
  TaskStatusParameter,
  toDateInputValue,
  validateDateInput,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { type ProjectTask, type TaskStatus } from "@/pages/projectData";

type GridColumn = {
  key: keyof ProjectTask;
  label: string;
  minWidth: number;
  width: string;
  hideHeaderText?: boolean;
  render?: (task: ProjectTask) => ReactNode;
};

const columns: GridColumn[] = [
  {
    key: "isFinished",
    label: "IsFinished",
    minWidth: 36,
    width: "36px",
    hideHeaderText: true,
    render: (task) => (
      <Checkbox
        checked={task.isFinished}
      />
    ),
  },
  {
    key: "subject",
    label: "Subject",
    minWidth: 480,
    width: "minmax(480px, 1.4fr)",
    render: (task) => <span className="truncate font-medium">{task.subject}</span>,
  },
  {
    key: "status",
    label: "Status",
    minWidth: 120,
    width: "120px",
  },
  {
    key: "dueDate",
    label: "Due Date",
    minWidth: 140,
    width: "140px",
  },
  {
    key: "priority",
    label: "Priority",
    minWidth: 100,
    width: "100px",
  },
  {
    key: "wikiPageLink",
    label: "Wiki Page",
    minWidth: 180,
    width: "minmax(180px, 1fr)",
    render: (task) => (
      <a
        className="min-w-0 truncate text-primary underline-offset-4 hover:underline"
        href={task.wikiPageLink}
      >
        {task.wikiPageLink}
      </a>
    ),
  },
  {
    key: "tag",
    label: "Tag",
    minWidth: 120,
    width: "120px",
    render: (task) => <Badge variant="secondary">{task.tag}</Badge>,
  },
  {
    key: "milestone",
    label: "Milestone",
    minWidth: 120,
    width: "120px",
  },
];

const gridTemplateColumns = columns.map((column) => column.width).join(" ");
const gridMinWidth = columns.reduce((total, column) => total + column.minWidth, 0);

type ProjectGridViewProps = {
  tasks: ProjectTask[];
};

export function ProjectGridView({ tasks }: ProjectGridViewProps) {
  const [dueDatePopup, setDueDatePopup] = useState<DueDatePopup | null>(null);
  const [editedDueDates, setEditedDueDates] = useState<Record<string, string>>(
    {}
  );
  const [editedStatuses, setEditedStatuses] = useState<
    Record<string, TaskStatus>
  >({});
  const [openStatusMenuTaskId, setOpenStatusMenuTaskId] = useState<
    string | null
  >(null);
  const [editedPriorities, setEditedPriorities] = useState<
    Record<string, ProjectTask["priority"]>
  >({});
  const [openPriorityMenuTaskId, setOpenPriorityMenuTaskId] = useState<
    string | null
  >(null);
  const [dueDateInput, setDueDateInput] = useState("");
  const [dueDateInputError, setDueDateInputError] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeCalendar = (event: PointerEvent) => {
      const target = event.target as HTMLElement;

      if (target.closest("[data-due-date-cell]")) {
        return;
      }

      if (
        calendarRef.current &&
        !calendarRef.current.contains(target)
      ) {
        setDueDatePopup(null);
      }
    };

    document.addEventListener("pointerdown", closeCalendar);

    return () => {
      document.removeEventListener("pointerdown", closeCalendar);
    };
  }, []);

  useEffect(() => {
    if (dueDatePopup?.mode === "text") {
      dueDateInputRef.current?.focus();
      dueDateInputRef.current?.select();
    }
  }, [dueDatePopup]);

  const getDueDateValue = (task: ProjectTask) =>
    (editedDueDates[task.id] ?? task.dueDate).replace(/-/g, "/");

  const getStatusValue = (task: ProjectTask) =>
    editedStatuses[task.id] ?? task.status;

  const getPriorityValue = (task: ProjectTask) =>
    editedPriorities[task.id] ?? task.priority;

  const selectStatus = (taskId: string, status: string) => {
    setEditedStatuses((currentStatuses) => ({
      ...currentStatuses,
      [taskId]: status as TaskStatus,
    }));
  };

  const selectPriority = (taskId: string, priority: string) => {
    setEditedPriorities((currentPriorities) => ({
      ...currentPriorities,
      [taskId]: priority as ProjectTask["priority"],
    }));
  };

  const openDueDatePopup = (
    task: ProjectTask,
    rect: DOMRect,
    mode: DueDatePopup["mode"]
  ) => {
    const currentDueDate = getDueDateValue(task);
    const today = new Date();
    const nextDueDate = currentDueDate || formatCalendarDate(today);

    if (!currentDueDate) {
      setEditedDueDates((currentDueDates) => ({
        ...currentDueDates,
        [task.id]: nextDueDate,
      }));
    }

    if (mode === "text") {
      setDueDateInput(toDateInputValue(nextDueDate));
    }

    setDueDateInputError("");
    setDueDatePopup({
      taskId: task.id,
      left: rect.left,
      top: rect.bottom + 6,
      mode,
    });
  };

  const openDueDateCalendar = (
    task: ProjectTask,
    button: HTMLButtonElement
  ) => {
    const rect = button.getBoundingClientRect();

    if (
      dueDatePopup?.taskId === task.id &&
      dueDatePopup.mode === "calendar"
    ) {
      openDueDatePopup(task, rect, "text");
      return;
    }

    openDueDatePopup(task, rect, "calendar");
  };

  const selectDueDate = (taskId: string, date?: Date) => {
    if (!date) {
      return;
    }

    setEditedDueDates((currentDueDates) => ({
      ...currentDueDates,
      [taskId]: formatCalendarDate(date),
    }));
    setDueDatePopup(null);
  };

  const changeDueDateInput = (event: ChangeEvent<HTMLInputElement>) => {
    setDueDateInput(toDateInputValue(event.target.value));
    setDueDateInputError("");
  };

  const saveDueDateInput = (taskId: string) => {
    const validatedDate = validateDateInput(dueDateInput);

    if (!validatedDate) {
      setDueDateInputError("YYYY/MM/DD の有効な日付を入力してください");
      return;
    }

    setEditedDueDates((currentDueDates) => ({
      ...currentDueDates,
      [taskId]: validatedDate,
    }));
    setDueDatePopup(null);
  };

  const handleDueDateInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    taskId: string
  ) => {
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !/^[\d/]$/.test(event.key)
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      saveDueDateInput(taskId);
    }

    if (event.key === "Escape") {
      setDueDatePopup(null);
    }
  };

  const renderCell = (task: ProjectTask, column: GridColumn) => {
    if (column.key === "status") {
      const status = getStatusValue(task);

      return (
        <TaskStatusParameter
          isOpen={openStatusMenuTaskId === task.id}
          onOpenChange={(isOpen) =>
            setOpenStatusMenuTaskId(isOpen ? task.id : null)
          }
          onSelectStatus={(value) => selectStatus(task.id, value)}
          status={status}
        />
      );
    }

    if (column.key === "priority") {
      const priority = getPriorityValue(task);

      return (
        <TaskPriorityParameter
          isOpen={openPriorityMenuTaskId === task.id}
          onOpenChange={(isOpen) =>
            setOpenPriorityMenuTaskId(isOpen ? task.id : null)
          }
          onSelectPriority={(value) => selectPriority(task.id, value)}
          priority={priority}
        />
      );
    }

    if (column.key === "dueDate") {
      const dueDate = getDueDateValue(task);
      const isActiveDueDateCell = dueDatePopup?.taskId === task.id;
      const isCalendarOpen =
        isActiveDueDateCell && dueDatePopup.mode === "calendar";
      const isTextInputOpen = isActiveDueDateCell && dueDatePopup.mode === "text";

      return (
        <TaskDueDateParameter
          calendarRef={calendarRef}
          dueDate={dueDate}
          dueDateInput={dueDateInput}
          dueDateInputError={dueDateInputError}
          dueDateInputRef={dueDateInputRef}
          isCalendarOpen={isCalendarOpen}
          isTextInputOpen={isTextInputOpen}
          onChangeDueDateInput={changeDueDateInput}
          onDueDateInputKeyDown={(event) =>
            handleDueDateInputKeyDown(event, task.id)
          }
          onOpenDueDateCalendar={(button) => openDueDateCalendar(task, button)}
          onSaveDueDateInput={() => saveDueDateInput(task.id)}
          onSelectDueDate={(date) => selectDueDate(task.id, date)}
          popup={dueDatePopup}
        />
      );
    }

    return column.render ? column.render(task) : String(task[column.key]);
  };

  return (
    <div className="max-w-full overflow-x-auto border bg-card">
      <div style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}>
        <div
          className="grid border-b bg-muted text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
          {columns.map((column) => (
            <div
              className="min-w-0 whitespace-nowrap px-[12px] py-[10px]"
              key={column.key}
            >
              {column.hideHeaderText ? (
                <span className="sr-only">{column.label}</span>
              ) : (
                column.label
              )}
            </div>
          ))}
        </div>

        <div className="grid">
          {tasks.map((task) => (
            <div
              className="grid border-b text-xs last:border-b-0 hover:bg-accent hover:text-accent-foreground"
              key={task.id}
              style={{ gridTemplateColumns }}
            >
              {columns.map((column) => (
                <div
                  className="flex min-w-0 items-center whitespace-nowrap px-[12px] py-[10px]"
                  key={column.key}
                  onDoubleClick={(event) => {
                    if (column.key === "status") {
                      setOpenStatusMenuTaskId(task.id);
                      return;
                    }

                    if (column.key === "priority") {
                      setOpenPriorityMenuTaskId(task.id);
                      return;
                    }

                    if (column.key === "dueDate") {
                      openDueDatePopup(
                        task,
                        event.currentTarget.getBoundingClientRect(),
                        "calendar"
                      );
                    }
                  }}
                >
                  {renderCell(task, column)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
