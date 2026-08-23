import { formatProjectTaskKey, type ProjectTask } from "@/features/task/projectTypes";

export function TaskKeyCell({ task }: { task: ProjectTask }) {
  const key = formatProjectTaskKey(task.id);
  return <span className={`block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground ${task.isFinished ? "line-through" : ""}`} title={key}>{key}</span>;
}
