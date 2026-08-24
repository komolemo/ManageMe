import {
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { type BucketName, type ProjectTask } from "@/features/task/projectTypes";

type CreateProjectTaskInput = {
  bucket?: string;
  id?: ProjectTask["id"];
  milestone?: string;
  name: string;
  now?: Date;
  status?: BucketName;
};

export function createProjectTaskRecord({
  bucket,
  id,
  milestone = "",
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
    bucket,
    status,
    dueDate: "",
    priority: "Medium",
    documentPageLink: "/task-document",
    tags: [],
    milestone,
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

export type ProjectListItem = {
  createdAt: string;
  isStarred: boolean;
  milestone: string;
  name: string;
  progress: number;
  status: string;
  updatedAt: string;
};

export function useCreateProjectForm(
  setProjects: Dispatch<SetStateAction<ProjectListItem[]>>
) {
  const newProjectNameInputRef = useRef<HTMLInputElement>(null);
  const createProjectButtonRef = useRef<HTMLButtonElement>(null);

  const updateCreateProjectButtonState = useCallback(() => {
    if (!createProjectButtonRef.current) {
      return;
    }

    createProjectButtonRef.current.disabled =
      !newProjectNameInputRef.current?.value.trim();
  }, []);

  const resetNewProjectNameInput = useCallback(() => {
    if (newProjectNameInputRef.current) {
      newProjectNameInputRef.current.value = "";
    }
    updateCreateProjectButtonState();
  }, [updateCreateProjectButtonState]);

  const createProject = useCallback(() => {
    const nextProjectName = newProjectNameInputRef.current?.value.trim();

    if (!nextProjectName) {
      return false;
    }

    setProjects((currentProjects) => [
      ...currentProjects,
      {
        createdAt: new Date().toISOString(),
        isStarred: false,
        name: nextProjectName,
        milestone: "",
        status: "",
        updatedAt: new Date().toISOString(),
        progress: 0,
      },
    ]);
    resetNewProjectNameInput();
    return true;
  }, [resetNewProjectNameInput, setProjects]);

  return {
    createProject,
    createProjectButtonRef,
    newProjectNameInputRef,
    resetNewProjectNameInput,
    updateCreateProjectButtonState,
  };
}
