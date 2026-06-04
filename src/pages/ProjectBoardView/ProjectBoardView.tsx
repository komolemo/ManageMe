import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { boardStatuses, type ProjectTask, type TaskStatus } from "@/pages/projectData";
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
  tasks: ProjectTask[];
};

export function ProjectBoardView({ tasks }: ProjectBoardViewProps) {
  const [activeCreateStatus, setActiveCreateStatus] =
    useState<TaskStatus | null>(null);
  const [createdTasks, setCreatedTasks] = useState<ProjectTask[]>([]);
  const [columnOverflowByStatus, setColumnOverflowByStatus] = useState<
    Partial<Record<TaskStatus, boolean>>
  >({});
  const columnScrollElementsRef = useRef(new Map<TaskStatus, HTMLDivElement>());
  const allTasks = useMemo(
    () => [...createdTasks, ...tasks],
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

  const openCreateTaskCard = (status: TaskStatus) => {
    setActiveCreateStatus(status);
  };

  const closeCreateTaskCard = () => {
    setActiveCreateStatus(null);
  };

  const addTask = (status: TaskStatus, taskName: string) => {
    const newTask: ProjectTask = {
      id: `board-task-${Date.now()}`,
      isFinished: false,
      subject: taskName,
      status,
      dueDate: "",
      priority: "Medium",
      wikiPageLink: "/task-wiki",
      tags: [],
      milestone: "",
      details: "",
    };

    setCreatedTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);
    addTaskToOrder(newTask.id);
    closeCreateTaskCard();
  };

  const updateColumnOverflowState = useCallback(() => {
    const nextColumnOverflowByStatus: Partial<Record<TaskStatus, boolean>> = {};

    boardStatuses.forEach((status) => {
      const columnScrollElement = columnScrollElementsRef.current.get(status);

      if (!columnScrollElement) {
        return;
      }

      nextColumnOverflowByStatus[status] =
        columnScrollElement.scrollHeight > columnScrollElement.clientHeight;
    });

    setColumnOverflowByStatus((currentColumnOverflowByStatus) => {
      const hasColumnOverflowChanged = boardStatuses.some(
        (status) =>
          (currentColumnOverflowByStatus[status] ?? false) !==
          (nextColumnOverflowByStatus[status] ?? false)
      );

      return hasColumnOverflowChanged
        ? nextColumnOverflowByStatus
        : currentColumnOverflowByStatus;
    });
  }, []);

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
    activeCreateStatus,
    boardTasks,
    updateColumnOverflowState,
  ]);

  return (
    <div className="h-full max-w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max gap-[16px]">
        {boardStatuses.map((status) => {
          const columnTasks = boardTasks.filter((task) => task.status === status);
          const isDragOverBucket = dragOverStatus === status;
          const isColumnOverflowing = columnOverflowByStatus[status] ?? false;

          return (
            <BoardColumn
              isColumnOverflowing={isColumnOverflowing}
              isDragOverBucket={isDragOverBucket}
              key={status}
              onDragOver={(event) => handleBucketDragOver(event, status)}
              onDrop={(event) => handleBucketDrop(event, status)}
              onOpenCreateTaskCard={() => openCreateTaskCard(status)}
              onScrollElementChange={(element) => {
                if (element) {
                  columnScrollElementsRef.current.set(status, element);
                  return;
                }

                columnScrollElementsRef.current.delete(status);
              }}
              status={status}
            >
              {activeCreateStatus === status ? (
                <CreateTaskCard
                  onAdd={(taskName) => addTask(status, taskName)}
                  onCancel={closeCreateTaskCard}
                  status={status}
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
