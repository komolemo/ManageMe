import {
  useCallback,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { type ProjectTask, type TaskStatus } from "@/pages/projectData";

export type TaskDropPosition = "before" | "after";

function moveTaskInOrder(
  taskOrder: string[],
  taskIds: string[],
  draggedTaskId: string,
  targetTaskId: string,
  dropPosition: TaskDropPosition
) {
  if (draggedTaskId === targetTaskId) {
    return taskOrder;
  }

  const nextTaskOrder = [
    ...taskOrder.filter((taskId) => taskIds.includes(taskId)),
    ...taskIds.filter((taskId) => !taskOrder.includes(taskId)),
  ].filter((taskId) => taskId !== draggedTaskId);
  const targetIndex = nextTaskOrder.indexOf(targetTaskId);

  if (targetIndex === -1) {
    return taskOrder;
  }

  nextTaskOrder.splice(
    dropPosition === "after" ? targetIndex + 1 : targetIndex,
    0,
    draggedTaskId
  );

  return nextTaskOrder;
}

export function useTaskDragAndDrop(tasks: ProjectTask[]) {
  const [taskOrder, setTaskOrder] = useState<string[]>([]);
  const [taskStatusOverrides, setTaskStatusOverrides] = useState<
    Partial<Record<string, TaskStatus>>
  >({});
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [taskDropPosition, setTaskDropPosition] =
    useState<TaskDropPosition>("after");

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const boardTasks = useMemo(() => {
    const taskOrderIndex = new Map(
      taskOrder.map((taskId, index) => [taskId, index])
    );

    return tasks
      .map((task) => ({
        ...task,
        status: taskStatusOverrides[task.id] ?? task.status,
      }))
      .sort((firstTask, secondTask) => {
        const firstIndex =
          taskOrderIndex.get(firstTask.id) ?? Number.MAX_SAFE_INTEGER;
        const secondIndex =
          taskOrderIndex.get(secondTask.id) ?? Number.MAX_SAFE_INTEGER;

        return firstIndex - secondIndex;
      });
  }, [taskOrder, taskStatusOverrides, tasks]);

  const addTaskToOrder = useCallback((taskId: string) => {
    setTaskOrder((currentTaskOrder) => [taskId, ...currentTaskOrder]);
  }, []);

  const clearTaskDragState = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
    setDragOverTaskId(null);
    setTaskDropPosition("after");
  }, []);

  const handleTaskDragStart = useCallback((
    event: DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    setDraggedTaskId(taskId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
  }, []);

  const handleBucketDragOver = useCallback((
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }, []);

  const handleBucketDrop = useCallback((
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) => {
    event.preventDefault();
    const taskId = draggedTaskId ?? event.dataTransfer.getData("text/plain");

    if (!boardTasks.some((task) => task.id === taskId)) {
      clearTaskDragState();
      return;
    }

    setTaskStatusOverrides((currentStatusOverrides) => ({
      ...currentStatusOverrides,
      [taskId]: status,
    }));
    setTaskOrder((currentTaskOrder) => {
      const nextTaskOrder = [
        ...currentTaskOrder.filter((currentTaskId) =>
          taskIds.includes(currentTaskId)
        ),
        ...taskIds.filter((currentTaskId) =>
          !currentTaskOrder.includes(currentTaskId)
        ),
      ].filter((currentTaskId) => currentTaskId !== taskId);
      const columnTaskIds = boardTasks
        .filter((task) => task.status === status && task.id !== taskId)
        .map((task) => task.id);
      const lastColumnTaskId = columnTaskIds[columnTaskIds.length - 1];

      if (!lastColumnTaskId) {
        return [taskId, ...nextTaskOrder];
      }

      const targetIndex = nextTaskOrder.indexOf(lastColumnTaskId);
      nextTaskOrder.splice(targetIndex + 1, 0, taskId);

      return nextTaskOrder;
    });
    clearTaskDragState();
  }, [boardTasks, clearTaskDragState, draggedTaskId, taskIds]);

  const handleTaskDragOver = useCallback((
    event: DragEvent<HTMLDivElement>,
    task: ProjectTask
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const nextDropPosition =
      event.clientY > rect.top + rect.height / 2 ? "after" : "before";

    setDragOverStatus(task.status);
    setDragOverTaskId(task.id);
    setTaskDropPosition(nextDropPosition);
  }, []);

  const handleTaskDrop = useCallback((
    event: DragEvent<HTMLDivElement>,
    targetTask: ProjectTask
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const taskId = draggedTaskId ?? event.dataTransfer.getData("text/plain");

    if (!boardTasks.some((task) => task.id === taskId)) {
      clearTaskDragState();
      return;
    }

    setTaskStatusOverrides((currentStatusOverrides) => ({
      ...currentStatusOverrides,
      [taskId]: targetTask.status,
    }));
    setTaskOrder((currentTaskOrder) =>
      moveTaskInOrder(
        currentTaskOrder,
        taskIds,
        taskId,
        targetTask.id,
        taskDropPosition
      )
    );
    clearTaskDragState();
  }, [
    boardTasks,
    clearTaskDragState,
    draggedTaskId,
    taskDropPosition,
    taskIds,
  ]);

  return {
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
  };
}
