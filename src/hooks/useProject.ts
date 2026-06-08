import { useCallback, type Dispatch, type SetStateAction } from "react";
import { type ProjectTask, type TaskStatus } from "@/pages/projectData";

type CreateProjectTaskInput = {
  id?: ProjectTask["id"];
  name: string;
  now?: Date;
  status?: TaskStatus;
};

export function createProjectTaskRecord({
  id,
  name,
  now = new Date(),
  status = "Not Started",
}: CreateProjectTaskInput): ProjectTask | null {
  const nextTaskName = name.trim();

  if (!nextTaskName) {
    return null;
  }

  return {
    id: id ?? now.getTime(),
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
