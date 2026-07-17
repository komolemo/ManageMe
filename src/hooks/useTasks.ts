import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  defaultProjectBuckets,
  defaultProjectMilestones,
  tasks,
  type ProjectTask,
  type ProjectTaskId,
} from "@/pages/projectData";

function findTaskById(
  currentTasks: ProjectTask[],
  taskId: ProjectTaskId,
): ProjectTask | undefined {
  for (const task of currentTasks) {
    if (task.id === taskId) {
      return task;
    }

    const childTask = findTaskById(task.children ?? [], taskId);

    if (childTask) {
      return childTask;
    }
  }

  return undefined;
}

export function useTaskTags({ taskId }: { taskId?: ProjectTaskId }) {
  const initialTask = taskId === undefined ? undefined : findTaskById(tasks, taskId);
  const [tags, setTags] = useState<string[]>(initialTask?.tags ?? []);

  useEffect(() => {
    setTags(initialTask?.tags ?? []);
  }, [initialTask]);

  return { setTags, tags };
}

export function useTasks({ taskId }: { taskId: ProjectTaskId }) {
  const initialTask = findTaskById(tasks, taskId);
  const [bucket, setBucket] = useState(
    initialTask?.bucket ?? defaultProjectBuckets[0]?.name ?? "",
  );
  const [priority, setPriority] = useState<ProjectTask["priority"]>(
    initialTask?.priority ?? "Medium",
  );
  const [milestone, setMilestone] = useState(initialTask?.milestone ?? "");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? "");
  const [parentTask, setParentTask] = useState<ProjectTask | null>(null);
  const [subtasks, setSubtasks] = useState<ProjectTask[]>(
    initialTask?.children ?? [],
  );
  const newSubtaskNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBucket(
      initialTask?.bucket ?? defaultProjectBuckets[0]?.name ?? "",
    );
    setPriority(initialTask?.priority ?? "Medium");
    setMilestone(initialTask?.milestone ?? "");
    setStartDate("");
    setDueDate(initialTask?.dueDate ?? "");
    setParentTask(null);
    setSubtasks(initialTask?.children ?? []);

    if (newSubtaskNameInputRef.current) {
      newSubtaskNameInputRef.current.value = "";
    }
  }, [initialTask]);

  const registerSubtask = (task: ProjectTask) => {
    setSubtasks((currentSubtasks) =>
      currentSubtasks.some((subtask) => subtask.id === task.id)
        ? currentSubtasks
        : [...currentSubtasks, task],
    );
  };

  const addSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameInput = newSubtaskNameInputRef.current;
    const subject = nameInput?.value.trim();

    if (!nameInput || !subject) {
      return;
    }

    const nextId =
      Math.max(
        0,
        ...tasks.map((task) => task.id),
        ...subtasks.map((task) => task.id),
      ) + 1;

    registerSubtask({
      id: nextId,
      isFinished: false,
      subject,
      status: "Not Started",
      dueDate: "",
      priority: "Medium",
      documentPageLink: "/task-document",
      tags: [],
      milestone,
      details: "",
    });
    nameInput.value = "";
  };

  return {
    addSubtask,
    bucket,
    buckets: defaultProjectBuckets,
    dueDate,
    existingTasks: tasks.filter((task) => task.id !== taskId),
    milestone,
    milestones: defaultProjectMilestones,
    newSubtaskNameInputRef,
    parentTask,
    priority,
    projectTasks: tasks,
    registerSubtask,
    setBucket,
    setDueDate,
    setMilestone,
    setParentTask,
    setPriority,
    setStartDate,
    startDate,
    subtasks,
  };
}
