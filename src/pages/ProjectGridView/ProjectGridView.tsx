import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type UIEvent,
  type WheelEvent,
} from "react";
import {
  formatCalendarDate,
  toDateInputValue,
  validateDateInput,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import {
  columnByKey,
  initialColumnOrder,
} from "@/pages/ProjectGridView/columns";
import { NewTaskForm } from "@/pages/ProjectGridView/NewTaskForm";
import { ProjectGridBody } from "@/pages/ProjectGridView/ProjectGridBody";
import { ProjectGridHeader } from "@/pages/ProjectGridView/ProjectGridHeader";
import { ProjectGridRow } from "@/pages/ProjectGridView/ProjectGridRow";
import { ProjectGridViewProvider } from "@/pages/ProjectGridView/ProjectGridViewContext";
import {
  flattenTaskRows,
  reorderColumns,
} from "@/pages/ProjectGridView/taskRows";
import type {
  ColumnDropPosition,
  GridColumn,
  GridColumnKey,
} from "@/pages/ProjectGridView/types";
import { type ProjectTask, type TaskStatus } from "@/pages/projectData";

type ProjectGridViewProps = {
  onOpenTaskDetails: (task: ProjectTask) => void;
  tasks: ProjectTask[];
};

export function ProjectGridView({
  onOpenTaskDetails,
  tasks,
}: ProjectGridViewProps) {
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
  const [editedFinishedTaskIds, setEditedFinishedTaskIds] = useState<
    Record<string, boolean>
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
    () => orderedColumns.reduce((total, column) => total + column.minWidth, 0),
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

      if (calendarRef.current && !calendarRef.current.contains(target)) {
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

  const getDueDateValue = useCallback(
    (task: ProjectTask) =>
      (editedDueDates[task.id] ?? task.dueDate).replace(/-/g, "/"),
    [editedDueDates]
  );

  const selectStatus = useCallback((taskId: string, status: string) => {
    setEditedStatuses((currentStatuses) => ({
      ...currentStatuses,
      [taskId]: status as TaskStatus,
    }));
  }, []);

  const selectPriority = useCallback((taskId: string, priority: string) => {
    setEditedPriorities((currentPriorities) => ({
      ...currentPriorities,
      [taskId]: priority as ProjectTask["priority"],
    }));
  }, []);

  const changeFinished = useCallback((taskId: string, isFinished: boolean) => {
    setEditedFinishedTaskIds((currentFinishedTaskIds) => ({
      ...currentFinishedTaskIds,
      [taskId]: isFinished,
    }));
  }, []);

  const toggleTaskExpansion = useCallback((taskId: string) => {
    setExpandedTaskIds((currentExpandedTaskIds) => {
      const nextExpandedTaskIds = new Set(currentExpandedTaskIds);

      if (nextExpandedTaskIds.has(taskId)) {
        nextExpandedTaskIds.delete(taskId);
      } else {
        nextExpandedTaskIds.add(taskId);
      }

      return nextExpandedTaskIds;
    });
  }, []);

  const changeStatusOpen = useCallback((taskId: string, isOpen: boolean) => {
    setOpenStatusMenuTaskId(isOpen ? taskId : null);
  }, []);

  const changePriorityOpen = useCallback((taskId: string, isOpen: boolean) => {
    setOpenPriorityMenuTaskId(isOpen ? taskId : null);
  }, []);

  const openDueDatePopup = useCallback(
    (task: ProjectTask, rect: DOMRect, mode: DueDatePopup["mode"]) => {
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
    },
    [getDueDateValue]
  );

  const openDueDateCalendar = useCallback(
    (task: ProjectTask, button: HTMLButtonElement) => {
      const rect = button.getBoundingClientRect();

      if (
        dueDatePopup?.taskId === task.id &&
        dueDatePopup.mode === "calendar"
      ) {
        openDueDatePopup(task, rect, "text");
        return;
      }

      openDueDatePopup(task, rect, "calendar");
    },
    [dueDatePopup, openDueDatePopup]
  );

  const selectDueDate = useCallback((taskId: string, date?: Date) => {
    if (!date) {
      return;
    }

    setEditedDueDates((currentDueDates) => ({
      ...currentDueDates,
      [taskId]: formatCalendarDate(date),
    }));
    setDueDatePopup(null);
  }, []);

  const changeDueDateInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDueDateInput(toDateInputValue(event.target.value));
      setDueDateInputError("");
    },
    []
  );

  const saveDueDateInput = useCallback(
    (taskId: string) => {
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
    },
    [dueDateInput]
  );

  const handleDueDateInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, taskId: string) => {
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
    },
    [saveDueDateInput]
  );

  const handleColumnDragStart = useCallback((
    event: DragEvent<HTMLDivElement>,
    columnKey: GridColumnKey
  ) => {
    setDraggedColumnKey(columnKey);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", columnKey);
  }, []);

  const handleColumnDragOver = useCallback((
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
  }, []);

  const handleColumnDrop = useCallback((
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
  }, [columnDropPosition, draggedColumnKey]);

  const clearColumnDragState = useCallback(() => {
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
    setColumnDropPosition("before");
  }, []);

  const handleHeaderWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const tableBodyScrollElement = tableBodyScrollRef.current;
    const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;

    if (!tableBodyScrollElement || horizontalDelta === 0) {
      return;
    }

    tableBodyScrollElement.scrollLeft += horizontalDelta;
    event.preventDefault();
  }, []);

  const handleTableBodyScroll = (event: UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
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

  const projectGridContextValue = useMemo(
    () => ({
      columnDropPosition,
      dragOverColumnKey,
      draggedColumnKey,
      onColumnDragEnd: clearColumnDragState,
      onColumnDragOver: handleColumnDragOver,
      onColumnDragStart: handleColumnDragStart,
      onColumnDrop: handleColumnDrop,
    }),
    [
      columnDropPosition,
      dragOverColumnKey,
      draggedColumnKey,
      clearColumnDragState,
      handleColumnDragOver,
      handleColumnDragStart,
      handleColumnDrop,
    ]
  );

  return (
    <div className="box-border flex min-h-0 flex-1 w-full max-w-full flex-col overflow-hidden border bg-card">
      <ProjectGridViewProvider value={projectGridContextValue}>
        {/* Project ヘッダー */}
        <ProjectGridHeader
          gridMinWidth={gridMinWidth}
          gridTemplateColumns={gridTemplateColumns}
          headerScrollRef={headerScrollRef}
          onWheel={handleHeaderWheel}
          orderedColumns={orderedColumns}
          scrollbarGutterWidth={scrollbarGutterWidth}
        />

        {/* Project チE�Eブル本佁E*/}
        <ProjectGridBody
          gridMinWidth={gridMinWidth}
          onScroll={handleTableBodyScroll}
          tableBodyScrollRef={tableBodyScrollRef}
        >
          {visibleTaskRows.map((row) => {
            const task = row.task;
            const isActiveDueDateCell = dueDatePopup?.taskId === task.id;
            const rowDueDatePopup = isActiveDueDateCell ? dueDatePopup : null;

            return (
              <ProjectGridRow
                calendarRef={calendarRef}
                depth={row.depth}
                dueDate={(editedDueDates[task.id] ?? task.dueDate).replace(
                  /-/g,
                  "/"
                )}
                dueDateInput={isActiveDueDateCell ? dueDateInput : ""}
                dueDateInputError={
                  isActiveDueDateCell ? dueDateInputError : ""
                }
                dueDateInputRef={dueDateInputRef}
                dueDatePopup={rowDueDatePopup}
                gridTemplateColumns={gridTemplateColumns}
                isCalendarOpen={rowDueDatePopup?.mode === "calendar"}
                isExpanded={expandedTaskIds.has(task.id)}
                isFinished={
                  editedFinishedTaskIds[task.id] ?? task.isFinished
                }
                isPriorityOpen={openPriorityMenuTaskId === task.id}
                isStatusOpen={openStatusMenuTaskId === task.id}
                isTextInputOpen={rowDueDatePopup?.mode === "text"}
                key={task.id}
                onChangeDueDateInput={changeDueDateInput}
                onDueDateInputKeyDown={handleDueDateInputKeyDown}
                onFinishedChange={changeFinished}
                onOpenDueDateCalendar={openDueDateCalendar}
                onOpenDueDatePopup={openDueDatePopup}
                onOpenTaskDetails={onOpenTaskDetails}
                onPriorityOpenChange={changePriorityOpen}
                onSaveDueDateInput={saveDueDateInput}
                onSelectDueDate={selectDueDate}
                onSelectPriority={selectPriority}
                onSelectStatus={selectStatus}
                onStatusOpenChange={changeStatusOpen}
                onToggleTaskExpansion={toggleTaskExpansion}
                orderedColumns={orderedColumns}
                priority={editedPriorities[task.id] ?? task.priority}
                status={editedStatuses[task.id] ?? task.status}
                task={task}
              />
            );
          })}
        </ProjectGridBody>
      </ProjectGridViewProvider>

      {/* 下部新規タスク作�Eフォーム */}
      <NewTaskForm
        inputRef={newTaskNameInputRef}
        onClear={clearNewTaskName}
        onSubmit={createNewTask}
      />
    </div>
  );
}
