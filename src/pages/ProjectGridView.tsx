import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type FormEvent,
  type RefObject,
  type UIEvent,
  type WheelEvent,
} from "react";
import { ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import {
  formatCalendarDate,
  TaskDueDateParameter,
  TaskPriorityParameter,
  TaskStatusParameter,
  toDateInputValue,
  validateDateInput,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
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

type ProjectGridTaskRow = {
  depth: number;
  task: ProjectTask;
};

const columns: GridColumn[] = [
  {
    key: "isFinished",
    label: "IsFinished",
    minWidth: 64,
    width: "64px",
    hideHeaderText: true,
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

function flattenTaskRows(
  tasks: ProjectTask[],
  expandedTaskIds: Set<string>,
  depth = 0
): ProjectGridTaskRow[] {
  return tasks.flatMap((task) => {
    const taskRow = { depth, task };

    if (!task.children?.length || !expandedTaskIds.has(task.id)) {
      return [taskRow];
    }

    return [
      taskRow,
      ...flattenTaskRows(task.children, expandedTaskIds, depth + 1),
    ];
  });
}

type ProjectGridHeaderProps = {
  columnDropPosition: ColumnDropPosition;
  dragOverColumnKey: GridColumnKey | null;
  draggedColumnKey: GridColumnKey | null;
  gridMinWidth: number;
  gridTemplateColumns: string;
  headerScrollRef: RefObject<HTMLDivElement | null>;
  onColumnDragEnd: () => void;
  onColumnDragOver: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDragStart: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDrop: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
  orderedColumns: GridColumn[];
  scrollbarGutterWidth: number;
};

// ProjectGridHeader コンポーネント: グリッド上部の列ヘッダー全体を担当します。
function ProjectGridHeader({
  columnDropPosition,
  dragOverColumnKey,
  draggedColumnKey,
  gridMinWidth,
  gridTemplateColumns,
  headerScrollRef,
  onColumnDragEnd,
  onColumnDragOver,
  onColumnDragStart,
  onColumnDrop,
  onWheel,
  orderedColumns,
  scrollbarGutterWidth,
}: ProjectGridHeaderProps) {
  return (
    <div
      className="box-border shrink-0 overflow-hidden"
      onWheel={onWheel}
      ref={headerScrollRef}
      style={{ paddingRight: `${scrollbarGutterWidth}px` }}
    >
      <div style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}>
        <div
          className="grid border-b bg-muted text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
          {/* ProjectGridHeaderCell コンポーネント: map された各列ヘッダーを担当します。 */}
          {orderedColumns.map((column) => (
            <ProjectGridHeaderCell
              column={column}
              columnDropPosition={columnDropPosition}
              dragOverColumnKey={dragOverColumnKey}
              draggedColumnKey={draggedColumnKey}
              key={column.key}
              onColumnDragEnd={onColumnDragEnd}
              onColumnDragOver={onColumnDragOver}
              onColumnDragStart={onColumnDragStart}
              onColumnDrop={onColumnDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type ProjectGridHeaderCellProps = {
  column: GridColumn;
  columnDropPosition: ColumnDropPosition;
  dragOverColumnKey: GridColumnKey | null;
  draggedColumnKey: GridColumnKey | null;
  onColumnDragEnd: () => void;
  onColumnDragOver: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDragStart: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
  onColumnDrop: (
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => void;
};

// ProjectGridHeaderCell コンポーネント: 1列分のヘッダー表示とドラッグ操作を担当します。
function ProjectGridHeaderCell({
  column,
  columnDropPosition,
  dragOverColumnKey,
  draggedColumnKey,
  onColumnDragEnd,
  onColumnDragOver,
  onColumnDragStart,
  onColumnDrop,
}: ProjectGridHeaderCellProps) {
  const isDraggedColumn = draggedColumnKey === column.key;
  const isDragOverColumn =
    dragOverColumnKey === column.key && draggedColumnKey !== column.key;
  const dragOverBorderClass =
    columnDropPosition === "after" ? "border-r-primary" : "border-l-primary";

  return (
    <div
      aria-label={`Move ${column.label} column`}
      className={`min-w-0 cursor-grab select-none whitespace-nowrap border-l-2 border-r-2 px-[8px] py-[4px] transition-colors active:cursor-grabbing ${
        isDragOverColumn
          ? `${dragOverBorderClass} bg-accent text-accent-foreground`
          : "border-l-transparent border-r-transparent"
      } ${isDraggedColumn ? "opacity-50" : ""}`}
      draggable
      onDragEnd={onColumnDragEnd}
      onDragOver={(event) => onColumnDragOver(event, column.key)}
      onDragStart={(event) => onColumnDragStart(event, column.key)}
      onDrop={(event) => onColumnDrop(event, column.key)}
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
}

type ProjectGridBodyProps = {
  gridMinWidth: number;
  gridTemplateColumns: string;
  onCellDoubleClick: (
    event: MouseEvent<HTMLDivElement>,
    row: ProjectGridTaskRow,
    column: GridColumn
  ) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  orderedColumns: GridColumn[];
  renderCell: (row: ProjectGridTaskRow, column: GridColumn) => ReactNode;
  tableBodyScrollRef: RefObject<HTMLDivElement | null>;
  visibleTaskRows: ProjectGridTaskRow[];
};

// ProjectGridBody コンポーネント: タスク一覧のスクロール領域全体を担当します。
function ProjectGridBody({
  gridMinWidth,
  gridTemplateColumns,
  onCellDoubleClick,
  onScroll,
  orderedColumns,
  renderCell,
  tableBodyScrollRef,
  visibleTaskRows,
}: ProjectGridBodyProps) {
  return (
    <div
      className="min-h-0 flex-1 basis-0 overflow-x-auto overflow-y-scroll [scrollbar-gutter:stable]"
      onScroll={onScroll}
      ref={tableBodyScrollRef}
    >
      <div
        className="grid"
        style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}
      >
        {/* ProjectGridRow コンポーネント: map された各タスク行を担当します。 */}
        {visibleTaskRows.map((row) => (
          <ProjectGridRow
            gridTemplateColumns={gridTemplateColumns}
            key={row.task.id}
            onCellDoubleClick={onCellDoubleClick}
            orderedColumns={orderedColumns}
            renderCell={renderCell}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

type ProjectGridRowProps = {
  gridTemplateColumns: string;
  onCellDoubleClick: (
    event: MouseEvent<HTMLDivElement>,
    row: ProjectGridTaskRow,
    column: GridColumn
  ) => void;
  orderedColumns: GridColumn[];
  renderCell: (row: ProjectGridTaskRow, column: GridColumn) => ReactNode;
  row: ProjectGridTaskRow;
};

// ProjectGridRow コンポーネント: 1タスク分の行と、その中のセル一覧を担当します。
function ProjectGridRow({
  gridTemplateColumns,
  onCellDoubleClick,
  orderedColumns,
  renderCell,
  row,
}: ProjectGridRowProps) {
  return (
    <div
      className="grid border-b text-xs last:border-b-0 hover:bg-accent hover:text-accent-foreground"
      style={{ gridTemplateColumns }}
    >
      {/* ProjectGridCell コンポーネント: map された各セルを担当します。 */}
      {orderedColumns.map((column) => (
        <ProjectGridCell
          column={column}
          key={column.key}
          onCellDoubleClick={onCellDoubleClick}
          renderCell={renderCell}
          row={row}
        />
      ))}
    </div>
  );
}

type ProjectGridCellProps = {
  column: GridColumn;
  onCellDoubleClick: (
    event: MouseEvent<HTMLDivElement>,
    row: ProjectGridTaskRow,
    column: GridColumn
  ) => void;
  renderCell: (row: ProjectGridTaskRow, column: GridColumn) => ReactNode;
  row: ProjectGridTaskRow;
};

// ProjectGridCell コンポーネント: 1つのセルの表示とダブルクリック操作を担当します。
function ProjectGridCell({
  column,
  onCellDoubleClick,
  renderCell,
  row,
}: ProjectGridCellProps) {
  return (
    <div
      className="flex min-w-0 items-center whitespace-nowrap px-[8px] mx-[2px] py-[4px]"
      onDoubleClick={(event) => onCellDoubleClick(event, row, column)}
    >
      {renderCell(row, column)}
    </div>
  );
}

type NewTaskFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// NewTaskForm コンポーネント: 新規タスク名の入力欄と追加ボタンを担当します。
function NewTaskForm({ inputRef, onClear, onSubmit }: NewTaskFormProps) {
  return (
    <form
      className="flex shrink-0 items-center gap-[8px] border-t bg-card px-[8px] py-[6px]"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="project-grid-new-task-name">
        Task name
      </label>
      <Input
        aria-label="Task name"
        className="h-[30px] pl-[8px] min-w-0 flex-1 border-0 rounded-md"
        id="project-grid-new-task-name"
        placeholder="Task name"
        ref={inputRef}
      />
      <Button
        className="h-[32px] px-[16px] rounded-md border-0"
        onClick={onClear}
        type="button"
        variant="outline"
      >
        Clear
      </Button>
      <CreateNewButton type="submit">
        Add Task
      </CreateNewButton>
    </form>
  );
}

type ProjectGridViewProps = {
  tasks: ProjectTask[];
};

export function ProjectGridView({ tasks }: ProjectGridViewProps) {
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
  const [createdTasks, setCreatedTasks] = useState<ProjectTask[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set()
  );
  const [scrollbarGutterWidth, setScrollbarGutterWidth] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const newTaskNameInputRef = useRef<HTMLInputElement>(null);
  const tableBodyScrollRef = useRef<HTMLDivElement>(null);
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
  const rootTasks = useMemo(
    () => [...createdTasks, ...tasks],
    [createdTasks, tasks]
  );
  const visibleTaskRows = useMemo(
    () => flattenTaskRows(rootTasks, expandedTaskIds),
    [expandedTaskIds, rootTasks]
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

  useEffect(() => {
    const tableBodyScrollElement = tableBodyScrollRef.current;

    if (!tableBodyScrollElement) {
      return;
    }

    const updateScrollbarGutterWidth = () => {
      setScrollbarGutterWidth(
        tableBodyScrollElement.offsetWidth - tableBodyScrollElement.clientWidth
      );
    };

    updateScrollbarGutterWidth();

    const resizeObserver = new ResizeObserver(updateScrollbarGutterWidth);
    resizeObserver.observe(tableBodyScrollElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskIds((currentExpandedTaskIds) => {
      const nextExpandedTaskIds = new Set(currentExpandedTaskIds);

      if (nextExpandedTaskIds.has(taskId)) {
        nextExpandedTaskIds.delete(taskId);
      } else {
        nextExpandedTaskIds.add(taskId);
      }

      return nextExpandedTaskIds;
    });
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

  const handleHeaderWheel = (event: WheelEvent<HTMLDivElement>) => {
    const tableBodyScrollElement = tableBodyScrollRef.current;
    const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;

    if (!tableBodyScrollElement || horizontalDelta === 0) {
      return;
    }

    tableBodyScrollElement.scrollLeft += horizontalDelta;
    event.preventDefault();
  };

  const handleTableBodyScroll = (event: UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  const handleCellDoubleClick = (
    event: MouseEvent<HTMLDivElement>,
    row: ProjectGridTaskRow,
    column: GridColumn
  ) => {
    const { task } = row;

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
  };

  const clearNewTaskName = () => {
    if (newTaskNameInputRef.current) {
      newTaskNameInputRef.current.value = "";
      newTaskNameInputRef.current.focus();
    }
  };

  const createNewTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTaskName = newTaskNameInputRef.current?.value.trim() ?? "";

    if (!nextTaskName) {
      return;
    }

    setCreatedTasks((currentTasks) => [
      {
        id: `created-task-${Date.now()}`,
        isFinished: false,
        subject: nextTaskName,
        status: "Not Started",
        dueDate: "",
        priority: "Medium",
        wikiPageLink: "/task-wiki",
        tags: [],
        milestone: "",
        details: "",
      },
      ...currentTasks,
    ]);
    if (newTaskNameInputRef.current) {
      newTaskNameInputRef.current.value = "";
    }
    requestAnimationFrame(() => {
      tableBodyScrollRef.current?.scrollTo({ top: 0 });
    });
  };

  const renderCell = (row: ProjectGridTaskRow, column: GridColumn) => {
    const { depth, task } = row;

    if (column.key === "isFinished") {
      const hasChildTasks = Boolean(task.children?.length);
      const isExpanded = expandedTaskIds.has(task.id);

      return (
        <div className="flex min-w-0 items-center gap-[4px]">
          <div className="flex size-[20px] shrink-0 items-center justify-center">
            {hasChildTasks ? (
              <Button
                aria-label={
                  isExpanded ? "Collapse child tasks" : "Expand child tasks"
                }
                className="size-[20px] shrink-0 rounded-sm border-0 bg-transparent p-0 hover:bg-muted"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTaskExpansion(task.id);
                }}
                type="button"
                variant="ghost"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            ) : depth > 0 ? (
              <CornerDownRight
                aria-hidden
                className="size-4 text-muted-foreground"
              />
            ) : null}
          </div>
          <div className="flex size-[20px] shrink-0 items-center justify-center">
            <Checkbox checked={task.isFinished} />
          </div>
        </div>
      );
    }

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

    if (column.key === "subject") {
      return (
        <span className="truncate font-medium">
          {task.subject}
        </span>
      );
    }

    return column.render ? column.render(task) : String(task[column.key]);
  };

  return (
    <div className="box-border flex min-h-0 flex-1 w-full max-w-full flex-col overflow-hidden border bg-card">
      {/* ProjectGridHeader コンポーネント: 列ヘッダー部分を担当します。 */}
      <ProjectGridHeader
        columnDropPosition={columnDropPosition}
        dragOverColumnKey={dragOverColumnKey}
        draggedColumnKey={draggedColumnKey}
        gridMinWidth={gridMinWidth}
        gridTemplateColumns={gridTemplateColumns}
        headerScrollRef={headerScrollRef}
        onColumnDragEnd={clearColumnDragState}
        onColumnDragOver={handleColumnDragOver}
        onColumnDragStart={handleColumnDragStart}
        onColumnDrop={handleColumnDrop}
        onWheel={handleHeaderWheel}
        orderedColumns={orderedColumns}
        scrollbarGutterWidth={scrollbarGutterWidth}
      />

      {/* ProjectGridBody コンポーネント: タスク行とセルの一覧部分を担当します。 */}
      <ProjectGridBody
        gridMinWidth={gridMinWidth}
        gridTemplateColumns={gridTemplateColumns}
        onCellDoubleClick={handleCellDoubleClick}
        onScroll={handleTableBodyScroll}
        orderedColumns={orderedColumns}
        renderCell={renderCell}
        tableBodyScrollRef={tableBodyScrollRef}
        visibleTaskRows={visibleTaskRows}
      />

      {/* NewTaskForm コンポーネント: 新規タスク追加フォーム部分を担当します。 */}
      <NewTaskForm
        inputRef={newTaskNameInputRef}
        onClear={clearNewTaskName}
        onSubmit={createNewTask}
      />
    </div>
  );
}
