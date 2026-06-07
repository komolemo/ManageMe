import { memo } from "react";
import type { ProjectTaskKey } from "@/pages/projectData";

export const TaskKeyCell = memo(function TaskKeyCell({
  isFinished,
  taskKey,
}: {
  isFinished: boolean;
  taskKey: ProjectTaskKey;
}) {
  const taskKeyClassName = isFinished
    ? "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground line-through"
    : "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground";

  return (
    <span className={taskKeyClassName} title={taskKey}>
      {taskKey}
    </span>
  );
});
