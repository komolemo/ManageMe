import { CalendarDays, CirclePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { boardStatuses, type ProjectTask, /*type TaskStatus*/ } from "@/pages/projectData";
import { Button } from "@/components/ui/button";

// const statusTone: Record<TaskStatus, "outline" | "secondary" | "default"> = {
//   "Not Started": "outline",
//   "In Progress": "secondary",
//   Review: "default",
// };

type ProjectBoardViewProps = {
  tasks: ProjectTask[];
};

export function ProjectBoardView({ tasks }: ProjectBoardViewProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex min-w-max gap-[16px]">
        {boardStatuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);

          return (
            <section className="shrink-0 bg-transparent gap-[16px]" style={{ width: "280px" }} key={status}>
              <header className="group/header bg-muted px-[12px] py-[4px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <h2 className="my-[4px] text-sm font-semibold">{status}</h2>
                </div>
                <div className="flex items-center justify-center group-hover/border-border group-hover/border-dashed">
                  <Button
                    aria-label={`Add task to ${status}`}
                    className="opacity-0 bg-transparent transition-opacity group-hover/header:opacity-100 focus-visible:opacity-100"
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <CirclePlus className="size-3" />
                  </Button>
                </div>
              </header>

              <div className="grid gap-[16px] my-[16px]">
                {columnTasks.map((task) => (
                  <Card className="p-[8px] bg-muted rounded-[2px] ring-0 shadow-[0_10px_15px_-3px_var(--shadow),0_4px_6px_-4px_var(--shadow)]" key={task.id} size="sm">
                    <CardHeader>
                      <CardTitle
                        className="grid h-[24px] w-full items-center gap-[8px] overflow-hidden whitespace-nowrap"
                        style={{ gridTemplateColumns: "16px minmax(0, 1fr)" }}
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center">
                          <Checkbox
                            checked={task.isFinished}
                          />
                        </span>
                        <span className="min-w-0 truncate">{task.subject}</span>
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
