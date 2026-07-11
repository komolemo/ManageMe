import { type DragEvent } from "react";
import { CalendarDays } from "lucide-react";
import { TaskProgress } from "@/components/app/TaskProgress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatProjectTaskKey,
  type ProjectTask,
} from "@/pages/projectData";
import { type TaskDropPosition } from "./useTaskDragAndDrop";

type TaskCardProps = {
  draggedTaskId: ProjectTask["id"] | null;
  dragOverTaskId: ProjectTask["id"] | null;
  nextTaskId?: ProjectTask["id"];
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, task: ProjectTask) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, taskId: ProjectTask["id"]) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, task: ProjectTask) => void;
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  onOpenTaskDetails: (task: ProjectTask) => void;
  task: ProjectTask;
  taskDropPosition: TaskDropPosition;
  taskIndex: number;
};

export function TaskCard({
  draggedTaskId,
  dragOverTaskId,
  nextTaskId,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onOpenTaskInNewTab,
  onOpenTaskDetails,
  task,
  taskDropPosition,
  taskIndex,
}: TaskCardProps) {
  const childTasks = task.children ?? [];
  const completedChildTaskCount = childTasks.filter(
    (childTask) => childTask.isFinished
  ).length;
  const isDragOverTask = dragOverTaskId === task.id && draggedTaskId !== task.id;
  const isBeforeTopTask = taskIndex === 0 && isDragOverTask && taskDropPosition === "before";
  const isAfterCurrentTask = isDragOverTask && taskDropPosition === "after";
  const isBeforeNextTask = (
    nextTaskId === dragOverTaskId &&
    draggedTaskId !== dragOverTaskId &&
    taskDropPosition === "before"
  );
  const taskDropBorderClass = 
    (isBeforeTopTask ? "border-t-primary" : isAfterCurrentTask || isBeforeNextTask) ?
    "border-b-primary" : "";

  return (
    <div
      className={`border-y-2 border-transparent py-[8px] ${taskDropBorderClass}`}
    >
      <Card
        className={`shrink-0 cursor-grab overflow-visible border-2 border-transparent p-[12px] bg-muted rounded-[2px] ring-0 shadow-[0_10px_15px_-3px_var(--shadow),0_4px_6px_-4px_var(--shadow)] active:cursor-grabbing ${
          draggedTaskId === task.id ? "opacity-50" : ""
        } `}
        draggable
        onDragEnd={onDragEnd}
        onDragOver={(event) => onDragOver(event, task)}
        onDragStart={(event) => onDragStart(event, task.id)}
        onDrop={(event) => onDrop(event, task)}
        onClick={() => onOpenTaskDetails(task)}
        onAuxClick={(event) => {
          if (event.button !== 1) {
            return;
          }

          event.preventDefault();
        }}
        onMouseDown={(event) => {
          if (event.button !== 1) {
            return;
          }

          event.preventDefault();
          onOpenTaskInNewTab(task);
        }}
        size="sm"
        style={{ overflow: "visible" }}
      >
        <CardHeader>
          <CardTitle
            className="min-h-[24px] w-full overflow-visible"
            style={{ overflow: "visible" }}
          >
            <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-[8px] items-start">
              <span className="flex ml-[4px] size-6 shrink-0 items-center justify-center">
                <Checkbox
                  checked={task.isFinished}
                  onClick={(event) => event.stopPropagation()}
                />
              </span>
              <span
                className="block min-w-0 max-w-full whitespace-normal text-muted-foreground"
                style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
              >
                {formatProjectTaskKey(task.id)}
              </span>              
            </div>

            <span
              className="block min-w-0 max-w-full whitespace-normal"
              style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
            >
              {task.subject}
            </span>
          </CardTitle>
          {/* <CardDescription>{task.details}</CardDescription> */}
        </CardHeader>
        <CardContent className="grid mt-[4px] gap-[8px] text-xs text-muted-foreground">
          {/* {task.tags.length ? (
            <div className="flex flex-wrap gap-[4px]">
              {task.tags.map((tag) => (
                <Badge className="border-0 bg-background text-muted-foreground" key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null} */}
          <div className="flex flex-wrap items-center gap-[6px]">
            <div className="flex items-center gap-[6px] text-xs text-muted-foreground">
              <CalendarDays className="size-[20px]" />
              {task.dueDate}
            </div>
            <Badge
              className="px-[6px] rounded-full border-1 bg-background text-muted-foreground"
              variant="outline"
            >
              {task.status}
            </Badge>
          </div>
          {childTasks.length > 0 && (
            <div>
              <TaskProgress
                completedCount={completedChildTaskCount}
                totalCount={childTasks.length}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
