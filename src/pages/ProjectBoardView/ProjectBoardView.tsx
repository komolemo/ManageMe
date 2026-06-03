import { useState } from "react";
import { CalendarDays, CirclePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { boardStatuses, type ProjectTask, type TaskStatus } from "@/pages/projectData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskProgress } from "@/components/app/TaskProgress";
import { CreateTaskCard } from "./CreateTaskCard";

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

  const openCreateTaskCard = (status: TaskStatus) => {
    setActiveCreateStatus(status);
  };

  const closeCreateTaskCard = () => {
    setActiveCreateStatus(null);
  };

  const addTask = (status: TaskStatus, taskName: string) => {
    setCreatedTasks((currentTasks) => [
      {
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
      },
      ...currentTasks,
    ]);
    closeCreateTaskCard();
  };

  const boardTasks = [...createdTasks, ...tasks];

  return (
    <div className="h-full max-w-full overflow-x-auto">
      <div className="flex h-full min-w-max gap-[16px]">
        {boardStatuses.map((status) => {
          const columnTasks = boardTasks.filter((task) => task.status === status);

          return (
            <section className="flex h-full min-h-0 shrink-0 flex-col bg-transparent gap-[8px]" style={{ width: "280px" }} key={status}>
              <header className="shrink-0 mr-[18px]">
                <div className="px-[12px] py-[8px] mb-[8px] bg-muted flex items-center justify-between">
                  <h2 className="my-[4px] text-sm font-semibold">{status}</h2>
                </div>
                <Button
                  aria-label={`Add task to ${status}`}
                  className="py-[8px] mx-[0px] w-full transition-opacity bg-muted border-0"
                  onClick={() => openCreateTaskCard(status)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <CirclePlus className="text-muted-foreground size-3" />
                </Button>
              </header>

              <div className="hover-scrollbar-y flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto pr-[8px]">
                {activeCreateStatus === status ? (
                  <CreateTaskCard
                    onAdd={(taskName) => addTask(status, taskName)}
                    onCancel={closeCreateTaskCard}
                    status={status}
                  />
                ) : null}
                {columnTasks.map((task) => {
                  const childTasks = task.children ?? [];
                  const completedChildTaskCount = childTasks.filter(
                    (childTask) => childTask.isFinished
                  ).length;

                  return (
                  <Card className="shrink-0 p-[12px] bg-muted rounded-[2px] ring-0 shadow-[0_10px_15px_-3px_var(--shadow),0_4px_6px_-4px_var(--shadow)]" key={task.id} size="sm">
                    <CardHeader>
                      <CardTitle
                        className="grid h-[24px] w-full items-center gap-[8px] overflow-hidden whitespace-nowrap"
                        style={{ gridTemplateColumns: "16px minmax(0, 1fr)" }}
                      >
                        <span className="flex ml-[4px] size-6 shrink-0 items-center justify-center">
                          <Checkbox
                            checked={task.isFinished}
                          />
                        </span>
                        <span className="min-w-0 truncate">{task.subject}</span>
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
                        <Badge className="px-[6px] rounded-full border-1 bg-background text-muted-foreground" variant="outline">
                          {task.status}
                        </Badge>
                      </div>                      <div>
                        <TaskProgress
                          completedCount={completedChildTaskCount}
                          totalCount={childTasks.length}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
