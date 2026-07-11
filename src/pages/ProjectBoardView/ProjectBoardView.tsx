import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCreateProjectTask } from "@/hooks/useProject";
import {
  boardStatuses,
  type BucketStatus,
  type ProjectBucket,
  type ProjectTask,
  type TaskStatus,
} from "@/pages/projectData";
import { BoardColumn } from "./BoardColumn";
import { CreateTaskCard } from "./CreateTaskCard";
import { TaskCard } from "./TaskCard";
import { useTaskDragAndDrop } from "./useTaskDragAndDrop";

// const statusTone: Record<TaskStatus, "outline" | "secondary" | "default"> = {
//   "Not Started": "outline",
//   "In Progress": "secondary",
//   Review: "default",
// };

type ProjectBoardViewProps = {
  buckets: ProjectBucket[];
  grouping: "progress" | "bucket";
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  onOpenTaskDetails: (task: ProjectTask) => void;
  tasks: ProjectTask[];
};

type BoardColumnModel = {
  bucketName?: string;
  id: string;
  label: string;
  status: TaskStatus;
};

function flattenBoardTasks(tasks: ProjectTask[]): ProjectTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenBoardTasks(task.children ?? []),
  ]);
}

export function ProjectBoardView({
  buckets,
  grouping,
  onOpenTaskInNewTab,
  onOpenTaskDetails,
  tasks,
}: ProjectBoardViewProps) {
  const [activeCreateColumnId, setActiveCreateColumnId] =
    useState<string | null>(null);
  const [createdTasks, setCreatedTasks] = useState<ProjectTask[]>([]);
  const addCreatedTask = useCreateProjectTask(setCreatedTasks);
  const [columnOverflowByStatus, setColumnOverflowByStatus] = useState<
    Partial<Record<string, boolean>>
  >({});
  const columnScrollElementsRef = useRef(new Map<string, HTMLDivElement>());
  const allTasks = useMemo(
    () => flattenBoardTasks([...createdTasks, ...tasks]),
    [createdTasks, tasks]
  );
  const {
    addTaskToOrder,
    boardTasks,
    clearTaskDragState,
    draggedTaskId,
    dragOverStatus,
    dragOverTaskId,
    handleBucketDragOver,
    handleBucketDrop,
    handleTaskDragOver,
    handleTaskDragStart,
    handleTaskDrop,
    taskDropPosition,
  } = useTaskDragAndDrop(allTasks);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets]
  );
  const boardColumns = useMemo(
    (): BoardColumnModel[] =>
      grouping === "bucket"
        ? sortedBuckets.map((bucket) => ({
            bucketName: bucket.name,
            id: bucket.id,
            label: bucket.name,
            status: statusFromBucketStatus(bucket.status),
          }))
        : boardStatuses.map((status) => ({
            id: status,
            label: status,
            status,
          })),
    [grouping, sortedBuckets]
  );

  const openCreateTaskCard = (columnId: string) => {
    setActiveCreateColumnId(columnId);
  };

  const closeCreateTaskCard = () => {
    setActiveCreateColumnId(null);
  };

  const addTask = (
    status: TaskStatus,
    taskName: string,
    bucketName?: string
  ) => {
    const newTask = addCreatedTask({
      bucket: bucketName,
      name: taskName,
      status,
    });

    if (!newTask) {
      return;
    }

    addTaskToOrder(newTask.id);
    closeCreateTaskCard();
  };

  const updateColumnOverflowState = useCallback(() => {
    const nextColumnOverflowByStatus: Partial<Record<string, boolean>> = {};

    boardColumns.forEach((column) => {
      const columnScrollElement = columnScrollElementsRef.current.get(column.id);

      if (!columnScrollElement) {
        return;
      }

      nextColumnOverflowByStatus[column.id] =
        columnScrollElement.scrollHeight > columnScrollElement.clientHeight;
    });

    setColumnOverflowByStatus((currentColumnOverflowByStatus) => {
      const hasColumnOverflowChanged = boardColumns.some(
        (column) =>
          (currentColumnOverflowByStatus[column.id] ?? false) !==
          (nextColumnOverflowByStatus[column.id] ?? false)
      );

      return hasColumnOverflowChanged
        ? nextColumnOverflowByStatus
        : currentColumnOverflowByStatus;
    });
  }, [boardColumns]);

  useLayoutEffect(() => {
    updateColumnOverflowState();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateColumnOverflowState);

    columnScrollElementsRef.current.forEach((columnScrollElement) => {
      resizeObserver?.observe(columnScrollElement);
    });
    window.addEventListener("resize", updateColumnOverflowState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateColumnOverflowState);
    };
  }, [
    activeCreateColumnId,
    boardTasks,
    updateColumnOverflowState,
  ]);

  return (
    <div className="h-full max-w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max gap-[16px]">
        {boardColumns.map((column) => {
          const columnTasks =
            grouping === "bucket"
              ? boardTasks.filter(
                  (task) =>
                    (task.bucket ?? sortedBuckets[0]?.name ?? "") ===
                    column.bucketName
                )
              : boardTasks.filter((task) => task.status === column.status);
          const isDragOverBucket =
            grouping === "progress" && dragOverStatus === column.status;
          const isColumnOverflowing =
            columnOverflowByStatus[column.id] ?? false;

          return (
            <BoardColumn
              isColumnOverflowing={isColumnOverflowing}
              isDragOverBucket={isDragOverBucket}
              key={column.id}
              onDragOver={(event) => {
                if (grouping === "progress") {
                  handleBucketDragOver(event, column.status);
                }
              }}
              onDrop={(event) => {
                if (grouping === "progress") {
                  handleBucketDrop(event, column.status);
                }
              }}
              onOpenCreateTaskCard={() => openCreateTaskCard(column.id)}
              onScrollElementChange={(element) => {
                if (element) {
                  columnScrollElementsRef.current.set(column.id, element);
                  return;
                }

                columnScrollElementsRef.current.delete(column.id);
              }}
              status={column.label}
            >
              {activeCreateColumnId === column.id ? (
                <CreateTaskCard
                  onAdd={(taskName) =>
                    addTask(column.status, taskName, column.bucketName)
                  }
                  onCancel={closeCreateTaskCard}
                  status={column.label}
                />
              ) : null}
              {columnTasks.map((task, taskIndex) => (
                <TaskCard
                  draggedTaskId={draggedTaskId}
                  dragOverTaskId={dragOverTaskId}
                  key={task.id}
                  nextTaskId={columnTasks[taskIndex + 1]?.id}
                  onDragEnd={clearTaskDragState}
                  onDragOver={handleTaskDragOver}
                  onDragStart={handleTaskDragStart}
                  onDrop={handleTaskDrop}
                  onOpenTaskInNewTab={onOpenTaskInNewTab}
                  onOpenTaskDetails={onOpenTaskDetails}
                  task={task}
                  taskDropPosition={taskDropPosition}
                  taskIndex={taskIndex}
                />
              ))}
            </BoardColumn>
          );
        })}
      </div>
    </div>
  );
}

function statusFromBucketStatus(status: BucketStatus): TaskStatus {
  if (status === 100) {
    return "Completed";
  }

  if (status === 50) {
    return "Review";
  }

  return "Not Started";
}
