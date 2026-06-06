import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ProjectTask, TaskStatus } from "@/pages/projectData";

type CreateProjectTaskInput = {
  idPrefix?: string;
  name: string;
  now?: Date;
  status?: TaskStatus;
};

export function createProjectTaskRecord({
  idPrefix = "created-task",
  name,
  now = new Date(),
  status = "Not Started",
}: CreateProjectTaskInput): ProjectTask | null {
  const nextTaskName = name.trim();

  if (!nextTaskName) {
    return null;
  }

  return {
    id: `${idPrefix}-${now.getTime()}`,
    isFinished: false,
    subject: nextTaskName,
    status,
    dueDate: "",
    priority: "Medium",
    wikiPageLink: "/task-wiki",
    tags: [],
    milestone: "",
    details: "",
  };
}

export function useCreateProjectTask(
  setProjectTasks: Dispatch<SetStateAction<ProjectTask[]>>
) {
  return useCallback(
    (input: CreateProjectTaskInput) => {
      const nextTask = createProjectTaskRecord(input);

      if (!nextTask) {
        return null;
      }

      setProjectTasks((currentTasks) => [nextTask, ...currentTasks]);

      return nextTask;
    },
    [setProjectTasks]
  );
}
