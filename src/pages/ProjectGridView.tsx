import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
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
import { TagButton } from "@/components/app/TagButton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  maxTaskTags,
  type ProjectTask,
  type TaskStatus,
} from "@/pages/projectData";

type GridColumn = {
  key: keyof ProjectTask;
  label: string;
  minWidth: number;
  width: string;
  hideHeaderText?: boolean;
  render?: (task: ProjectTask) => ReactNode;
};

type GridColumnKey = GridColumn["key"];
type ColumnDropPosition = "before" | "after";

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
    key: "milestone",
    label: "Milestone",
    minWidth: 120,
    width: "120px",
  },
  {
    key: "tags",
    label: "Tag",
    minWidth: 420,
    width: "420px",
  },
];

const initialColumnOrder = columns.map((column) => column.key);
const columnByKey = new Map(columns.map((column) => [column.key, column]));

function reorderColumns(
  columnOrder: GridColumnKey[],
  draggedColumnKey: GridColumnKey,
  targetColumnKey: GridColumnKey,
  dropPosition: ColumnDropPosition
) {
  if (draggedColumnKey === targetColumnKey) {
    return columnOrder;
  }

  const nextColumnOrder = columnOrder.filter(
    (columnKey) => columnKey !== draggedColumnKey
  );
  const targetIndex = nextColumnOrder.indexOf(targetColumnKey);

  if (targetIndex === -1) {
    return columnOrder;
  }

  nextColumnOrder.splice(
    dropPosition === "after" ? targetIndex + 1 : targetIndex,
    0,
    draggedColumnKey
  );

  return nextColumnOrder;
}

type TagScrollerProps = {
  onSearchTag: (tag: string) => void;
  tags: ProjectTask["tags"];
};

function TagScroller({ onSearchTag, tags }: TagScrollerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const getViewport = useCallback(() => {
    return scrollAreaRef.current?.querySelector<HTMLElement>(
      "[data-slot='scroll-area-viewport']"
    );
  }, []);

  const updateHasOverflow = useCallback(() => {
    const viewport = getViewport();

    if (!viewport) {
      setHasOverflow(false);
      return;
    }

    setHasOverflow(viewport.scrollWidth > viewport.clientWidth);
  }, [getViewport]);

  useEffect(() => {
    updateHasOverflow();

    const viewport = getViewport();

    if (!viewport) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateHasOverflow);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [getViewport, tags, updateHasOverflow]);

  return (
    <ScrollArea
      className="group w-full min-w-0 pb-[7px] pt-[1px] [&_[data-orientation=vertical]]:hidden"
      ref={scrollAreaRef}
      type="hover"
    >
      <div className="flex w-max gap-[4px]">
        {tags.slice(0, maxTaskTags).map((tag) => (
          <TagButton
            className="max-w-[126px] shrink-0"
            key={tag}
            onSearchTag={onSearchTag}
            tag={tag}
          />
        ))}
      </div>
      {hasOverflow ? (
        <ScrollBar
          className="h-[6px] border-t-0 p-0 opacity-0 transition-opacity group-hover:opacity-100 [&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/30"
          orientation="horizontal"
        />
      ) : null}
    </ScrollArea>
  );
}

type ProjectGridViewProps = {
  onSearchTag: (tag: string) => void;
  tasks: ProjectTask[];
};

export function ProjectGridView({ onSearchTag, tasks }: ProjectGridViewProps) {
  const [columnOrder, setColumnOrder] = useState<GridColumnKey[]>(
    initialColumnOrder
  );
  const [draggedColumnKey, setDraggedColumnKey] =
    useState<GridColumnKey | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] =
    useState<GridColumnKey | null>(null);
  const [columnDropPosition, setColumnDropPosition] =
    useState<ColumnDropPosition>("before");
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
  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((columnKey) => columnByKey.get(columnKey))
        .filter((column): column is GridColumn => Boolean(column)),
    [columnOrder]
  );
  const gridTemplateColumns = useMemo(
    () => orderedColumns.map((column) => column.width).join(" "),
    [orderedColumns]
  );
  const gridMinWidth = useMemo(
    () =>
      orderedColumns.reduce((total, column) => total + column.minWidth, 0),
    [orderedColumns]
  );

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

  const handleColumnDragStart = (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => {
    setDraggedColumnKey(columnKey);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", columnKey);
  };

  const handleColumnDragOver = (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const nextDropPosition =
      event.clientX > rect.left + rect.width / 2 ? "after" : "before";

    setDragOverColumnKey(columnKey);
    setColumnDropPosition(nextDropPosition);
  };

  const handleColumnDrop = (
    event: DragEvent<HTMLDivElement>,
    targetColumnKey: GridColumnKey
  ) => {
    event.preventDefault();

    const sourceColumnKey =
      draggedColumnKey ??
      (event.dataTransfer.getData("text/plain") as GridColumnKey);

    if (!columnByKey.has(sourceColumnKey)) {
      return;
    }

    setColumnOrder((currentColumnOrder) =>
      reorderColumns(
        currentColumnOrder,
        sourceColumnKey,
        targetColumnKey,
        columnDropPosition
      )
    );
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  };

  const clearColumnDragState = () => {
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
    setColumnDropPosition("before");
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

    if (column.key === "tags") {
      return <TagScroller onSearchTag={onSearchTag} tags={task.tags} />;
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
          {orderedColumns.map((column) => {
            const isDraggedColumn = draggedColumnKey === column.key;
            const isDragOverColumn =
              dragOverColumnKey === column.key && draggedColumnKey !== column.key;
            const dragOverBorderClass =
              columnDropPosition === "after"
                ? "border-r-primary"
                : "border-l-primary";

            return (
              <div
                aria-label={`Move ${column.label} column`}
                className={`min-w-0 cursor-grab select-none whitespace-nowrap border-l-2 border-r-2 px-[8px] py-[4px] transition-colors active:cursor-grabbing ${
                  isDragOverColumn
                    ? `${dragOverBorderClass} bg-accent text-accent-foreground`
                    : "border-l-transparent border-r-transparent"
                } ${isDraggedColumn ? "opacity-50" : ""}`}
                draggable
                key={column.key}
                onDragEnd={clearColumnDragState}
                onDragOver={(event) => handleColumnDragOver(event, column.key)}
                onDragStart={(event) =>
                  handleColumnDragStart(event, column.key)
                }
                onDrop={(event) => handleColumnDrop(event, column.key)}
                role="button"
                tabIndex={0}
                title={`Drag to move ${column.label} column`}
              >
                {column.hideHeaderText ? (
                  <span className="sr-only">{column.label}</span>
                ) : (
                  column.label
                )}
              </div>
            );
          })}
        </div>

        <div className="grid">
          {tasks.map((task) => (
            <div
              className="grid border-b text-xs last:border-b-0 hover:bg-accent hover:text-accent-foreground"
              key={task.id}
              style={{ gridTemplateColumns }}
            >
              {orderedColumns.map((column) => (
                <div
                  className={`flex min-w-0 whitespace-nowrap px-[8px] ${
                    column.key === "tags"
                      ? "items-center overflow-hidden py-[4px]"
                      : "items-center py-[4px]"
                  }`}
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
