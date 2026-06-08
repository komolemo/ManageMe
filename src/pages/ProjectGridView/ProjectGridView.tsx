import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type UIEvent,
  type WheelEvent,
} from "react";
import { type DueDatePopup } from "@/components/app/TaskParameters";
import { useCreateProjectTask } from "@/hooks/useProject";
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
  const [editedDueDates, setEditedDueDates] = useState<
    Partial<Record<ProjectTask["id"], string>>
  >({});
  const [editedStatuses, setEditedStatuses] = useState<
    Partial<Record<ProjectTask["id"], TaskStatus>>
  >({});
  const [editedFinishedTaskIds, setEditedFinishedTaskIds] = useState<
    Partial<Record<ProjectTask["id"], boolean>>
  >({});
  const [openStatusMenuTaskId, setOpenStatusMenuTaskId] = useState<
    ProjectTask["id"] | null
  >(null);
  const [editedPriorities, setEditedPriorities] = useState<
    Partial<Record<ProjectTask["id"], ProjectTask["priority"]>>
  >({});
  const [openPriorityMenuTaskId, setOpenPriorityMenuTaskId] = useState<
    ProjectTask["id"] | null
  >(null);

  const [createdTasks, setCreatedTasks] = useState<ProjectTask[]>([]);
  const addCreatedTask = useCreateProjectTask(setCreatedTasks);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<ProjectTask["id"]>>(
    () => new Set()
  );
  const [scrollbarGutterWidth, setScrollbarGutterWidth] = useState(0);

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
      setDueDatePopup(null);
    };

    document.addEventListener("pointerdown", closeCalendar);

    return () => {
      document.removeEventListener("pointerdown", closeCalendar);
    };
  }, []);


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


  const selectStatus = useCallback((taskId: ProjectTask["id"], status: string) => {
    setEditedStatuses((currentStatuses) => ({
      ...currentStatuses,
      [taskId]: status as TaskStatus,
    }));
  }, []);

  const selectPriority = useCallback((taskId: ProjectTask["id"], priority: string) => {
    setEditedPriorities((currentPriorities) => ({
      ...currentPriorities,
      [taskId]: priority as ProjectTask["priority"],
    }));
  }, []);

  const changeFinished = useCallback((taskId: ProjectTask["id"], isFinished: boolean) => {
    setEditedFinishedTaskIds((currentFinishedTaskIds) => ({
      ...currentFinishedTaskIds,
      [taskId]: isFinished,
    }));
  }, []);

  const toggleTaskExpansion = useCallback((taskId: ProjectTask["id"]) => {
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

  const changeStatusOpen = useCallback((taskId: ProjectTask["id"], isOpen: boolean) => {
    setOpenStatusMenuTaskId(isOpen ? taskId : null);
  }, []);

  const changePriorityOpen = useCallback((taskId: ProjectTask["id"], isOpen: boolean) => {
    setOpenPriorityMenuTaskId(isOpen ? taskId : null);
  }, []);

  const openDueDatePopup = useCallback(
    (task: ProjectTask, rect: DOMRect, mode: DueDatePopup["mode"]) => {
      setDueDatePopup({
        taskId: task.id,
        left: rect.left,
        top: rect.bottom + 6,
        mode,
      });
    },
    []
  );

  const updateDueDate = useCallback((taskId: ProjectTask["id"], date: string) => {
    setEditedDueDates((currentDueDates) => ({
      ...currentDueDates,
      [taskId]: date,
    }));
  }, []);

  const closeDueDatePopup = useCallback(() => {
    setDueDatePopup(null);
  }, []);

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
    const nextTask = addCreatedTask({
      name: newTaskNameInputRef.current?.value ?? "",
      status: "Not Started",
    });

    if (!nextTask) {
      return;
    }

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
        {/* Project 繝倥ャ繝繝ｼ */}
        <ProjectGridHeader
          gridMinWidth={gridMinWidth}
          gridTemplateColumns={gridTemplateColumns}
          headerScrollRef={headerScrollRef}
          onWheel={handleHeaderWheel}
          orderedColumns={orderedColumns}
          scrollbarGutterWidth={scrollbarGutterWidth}
        />

        {/* Project 繝・・繝悶Ν譛ｬ菴・*/}
        <ProjectGridBody
          gridMinWidth={gridMinWidth}
          onScroll={handleTableBodyScroll}
          tableBodyScrollRef={tableBodyScrollRef}
        >
          {visibleTaskRows.map((row) => {
            const task = row.task;
            const isActiveDueDateCell = dueDatePopup?.taskId === task.id;

            return (
              <ProjectGridRow
                depth={row.depth}
                dueDate={(editedDueDates[task.id] ?? task.dueDate).replace(
                  /-/g,
                  "/"
                )}
                dueDatePopup={isActiveDueDateCell ? dueDatePopup : null}
                gridTemplateColumns={gridTemplateColumns}
                isExpanded={expandedTaskIds.has(task.id)}
                isFinished={
                  editedFinishedTaskIds[task.id] ?? task.isFinished
                }
                isPriorityOpen={openPriorityMenuTaskId === task.id}
                isStatusOpen={openStatusMenuTaskId === task.id}
                key={task.id}
                onDueDateClose={closeDueDatePopup}
                onDueDateCommit={updateDueDate}
                onFinishedChange={changeFinished}
                onOpenDueDatePopup={openDueDatePopup}
                onOpenTaskDetails={onOpenTaskDetails}
                onPriorityOpenChange={changePriorityOpen}
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

      {/* 荳矩Κ譁ｰ隕上ち繧ｹ繧ｯ菴懈・繝輔か繝ｼ繝 */}
      <NewTaskForm
        inputRef={newTaskNameInputRef}
        onClear={clearNewTaskName}
        onSubmit={createNewTask}
      />
    </div>
  );
}
