import { CalendarDays, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { boardStatuses, type ProjectTask, type TaskStatus } from "@/pages/projectData";

const statusTone: Record<TaskStatus, "outline" | "secondary" | "default"> = {
  "Not Started": "outline",
  "In Progress": "secondary",
  Review: "default",
};

export function ProjectBoardView({ tasks }: { tasks: ProjectTask[] }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex min-w-max gap-3">
        {boardStatuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);

          return (
            <section className="shrink-0 border bg-muted" style={{width: "280px"}} key={status}>
              <header className="border-b bg-card p-[12px]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">{status}</h2>
                  <Badge variant={statusTone[status]}>{columnTasks.length}</Badge>
                </div>
              </header>

              <div className="grid gap-[8px] p-[8px]">
                {columnTasks.map((task) => (
                  <Card className="p-[8px]" key={task.id} size="sm">
                    <CardHeader>
                      <CardTitle
                        className="grid h-[20px] w-full items-center gap-[8px] overflow-hidden whitespace-nowrap"
                        style={{ gridTemplateColumns: "16px minmax(0, 1fr) 16px" }}
                      >
                        <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                          <Checkbox
                            checked={task.isFinished}
                            className="data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
                          />
                        </span>
                        <span className="min-w-0 truncate">{task.subject}</span>
                        <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                          <MoreHorizontal className="size-4" />
                        </span>
                      </CardTitle>
                      <CardDescription>{task.details}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-[6px] text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {task.dueDate}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
