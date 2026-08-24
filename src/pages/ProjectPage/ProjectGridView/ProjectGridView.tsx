import { useCallback, useMemo, useState } from "react";
import type { ProjectTask } from "@/features/task/projectTypes";
import { useCreateProjectTask } from "@/hooks/useProject";
import { ProjectTable } from "./ProjectTable/ProjectTable";
import { ProjectTableFooter } from "./ProjectTable/ProjectTableFooter";

type ProjectGridViewProps = {
  bucketNames: string[];
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  onOpenTaskDetails: (task: ProjectTask) => void;
  tasks: ProjectTask[];
};

export function ProjectGridView({
  bucketNames,
  onOpenTaskInNewTab,
  onOpenTaskDetails,
  tasks,
}: ProjectGridViewProps) {
  const [createdTasks, setCreatedTasks] = useState<ProjectTask[]>([]);
  const addCreatedTask = useCreateProjectTask(setCreatedTasks);
  const allTasks = useMemo(
    () => [...createdTasks, ...tasks],
    [createdTasks, tasks]
  );
  const createTask = useCallback(
    (name: string) => Boolean(addCreatedTask({ name, status: "Not Started" })),
    [addCreatedTask]
  );

  return (
    <div className="box-border flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden border bg-card">
      <ProjectTable
        bucketNames={bucketNames}
        onOpenTaskDetails={onOpenTaskDetails}
        onOpenTaskInNewTab={onOpenTaskInNewTab}
        tasks={allTasks}
      />
      <ProjectTableFooter onCreateTask={createTask} />
    </div>
  );
}
