import type { MouseEvent } from "react";
import { CornerDownRight } from "lucide-react";
import type { ProjectTask } from "@/features/task/projectTypes";

export function SubjectCell({ depth, onOpenTaskDetails, onOpenTaskInNewTab, task }: { depth: number; onOpenTaskDetails: (task: ProjectTask) => void; onOpenTaskInNewTab: (task: ProjectTask) => void; task: ProjectTask }) {
  const className = task.isFinished ? "text-muted-foreground line-through" : "";
  return <div className="flex w-full min-w-0 items-center gap-[4px] overflow-hidden">
    {depth > 0 ? <CornerDownRight aria-hidden className={`size-4 shrink-0 text-muted-foreground ${depth > 1 ? "ml-[24px]" : ""}`} /> : null}
    <button className={`block min-w-0 flex-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-0 bg-transparent p-0 text-left font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring ${className}`} onClick={() => onOpenTaskDetails(task)} onAuxClick={(event: MouseEvent<HTMLButtonElement>) => { if (event.button === 1) event.preventDefault() }} onMouseDown={(event) => { if (event.button === 1) { event.preventDefault(); onOpenTaskInNewTab(task) } }} title={task.subject} type="button">{task.subject}</button>
  </div>;
}
