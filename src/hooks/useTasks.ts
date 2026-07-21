import { useEffect, useRef, useState, type FormEvent } from "react";
import { taskApi } from "@/features/task/taskApi";
import type { TaskRecord } from "@/features/task/types";
import {
  defaultProjectBuckets,
  defaultProjectMilestones,
  type ProjectBucket,
  type ProjectMilestone,
  type ProjectTask,
  type ProjectTaskId,
  type TaskStatus,
} from "@/pages/projectData";

const priorityLabels: ProjectTask["priority"][] = [
  "Low",
  "Medium",
  "High",
  "Emergency",
];

function statusLabel(statusId: TaskRecord["statusId"]): TaskStatus {
  if (statusId === 100) return "Completed";
  if (statusId === 50) return "In Progress";
  return "Not Started";
}

function mapTask(
  task: TaskRecord,
  buckets: ProjectBucket[],
  milestones: ProjectMilestone[],
): ProjectTask | null {
  const id = Number(task.taskId);
  if (!Number.isSafeInteger(id)) return null;

  return {
    id,
    isFinished: task.completePercentage === 100,
    subject: task.title,
    bucket: buckets.find((bucket) => bucket.id === task.bucketId)?.name,
    status: statusLabel(task.statusId),
    dueDate: task.dueDate ?? "",
    priority: priorityLabels[task.priorityId] ?? "Medium",
    documentPageLink: "/task-document",
    tags: [],
    milestone:
      milestones.find((milestone) => milestone.id === task.milestoneId)?.name ??
      task.milestoneId,
    details: task.description,
  };
}

export function useWorkspaceTasks(
  workspaceId: string | undefined,
  buckets: ProjectBucket[],
  milestones: ProjectMilestone[],
) {
  const [records, setRecords] = useState<TaskRecord[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);

  useEffect(() => {
    let cancelled = false;
    setRecords([]);
    setProjectTasks([]);
    if (!workspaceId) return () => { cancelled = true; };

    void taskApi.list(workspaceId).then((tasks) => {
      if (!cancelled) setRecords(tasks);
    }).catch(() => {
      if (!cancelled) setRecords([]);
    });
    return () => { cancelled = true; };
  }, [workspaceId]);

  useEffect(() => {
    const mappedTasks = records.flatMap((record) => {
      const task = mapTask(record, buckets, milestones);
      return task ? [{ record, task }] : [];
    });
    const tasksById = new Map(
      mappedTasks.map(({ record, task }) => [record.taskId, task]),
    );
    const roots: ProjectTask[] = [];

    for (const { record, task } of mappedTasks) {
      const parent = record.parentTaskId
        ? tasksById.get(record.parentTaskId)
        : undefined;
      if (parent && parent !== task) {
        parent.children = [...(parent.children ?? []), task];
      } else {
        roots.push(task);
      }
    }
    setProjectTasks(roots);
  }, [buckets, milestones, records]);

  return { projectTasks, setProjectTasks };
}

export function useTaskTags(_options?: { taskId?: ProjectTaskId }) {
  const [tags, setTags] = useState<string[]>([]);
  return { setTags, tags };
}

export function useTasks({ taskId }: { taskId: ProjectTaskId }) {
  const [task, setTask] = useState<ProjectTask>();
  const buckets = defaultProjectBuckets;
  const milestones = defaultProjectMilestones;
  const [bucket, setBucket] = useState(buckets[0]?.name ?? "");
  const [priority, setPriority] = useState<ProjectTask["priority"]>("Medium");
  const [milestone, setMilestone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentTask, setParentTask] = useState<ProjectTask | null>(null);
  const [subtasks, setSubtasks] = useState<ProjectTask[]>([]);
  const newSubtaskNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void taskApi.getById(String(taskId)).then((record) => {
      if (!cancelled) setTask(record ? mapTask(record, buckets, milestones) ?? undefined : undefined);
    }).catch(() => { if (!cancelled) setTask(undefined); });
    return () => { cancelled = true; };
  }, [taskId]);

  useEffect(() => {
    setBucket(task?.bucket ?? buckets[0]?.name ?? "");
    setPriority(task?.priority ?? "Medium");
    setMilestone(task?.milestone ?? "");
    setStartDate("");
    setDueDate(task?.dueDate ?? "");
    setParentTask(null);
    setSubtasks([]);
  }, [task]);

  const registerSubtask = (subtask: ProjectTask) => setSubtasks((current) =>
    current.some(({ id }) => id === subtask.id) ? current : [...current, subtask]);

  const addSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = newSubtaskNameInputRef.current;
    const subject = input?.value.trim();
    if (!input || !subject) return;
    registerSubtask({
      id: Date.now(), isFinished: false, subject, status: "Not Started",
      dueDate: "", priority: "Medium", documentPageLink: "/task-document",
      tags: [], milestone, details: "",
    });
    input.value = "";
  };

  return {
    addSubtask, bucket, buckets, dueDate, existingTasks: [], milestone,
    milestones, newSubtaskNameInputRef, parentTask, priority,
    projectTasks: task ? [task] : [], registerSubtask, setBucket, setDueDate,
    setMilestone, setParentTask, setPriority, setStartDate, startDate, subtasks,
  };
}
