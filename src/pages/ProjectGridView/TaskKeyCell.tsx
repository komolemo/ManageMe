import { memo } from "react";
import {
  formatProjectTaskKey,
  type ProjectTask,
} from "@/features/task/projectTypes";

export const TaskKeyCell = memo(function TaskKeyCell({
  isFinished,
  taskId,
}: {
  isFinished: boolean;
  taskId: ProjectTask["id"];
}) {
  const taskKey = formatProjectTaskKey(taskId);
  const taskKeyClassName = isFinished
    ? "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground line-through"
    : "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground";

  return (
    <span className={taskKeyClassName} title={taskKey}>
      {taskKey}
    </span>
  );
});
