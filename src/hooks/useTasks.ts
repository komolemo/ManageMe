import { useEffect, useRef, useState, type FormEvent } from "react";
import { taskApi } from "@/features/task/taskApi";
import { bucketApi } from "@/features/bucket/bucketApi";
import { milestoneApi } from "@/features/milestone/milestoneApi";
import { taskPriorityLabels } from "@/features/task/taskPriority";
import { tagBindApi } from "@/features/tag/tagBindApi";
import type { TaskRecord } from "@/features/task/types";
import {
  type ProjectBucket,
  type ProjectMilestone,
  type ProjectTask,
  type ProjectTaskId,
  type BucketName,
} from "@/features/task/projectTypes";

function fallbackBucketName(statusId: TaskRecord["statusId"]): BucketName {
  if (statusId === 100) return "Completed";
  if (statusId === 50) return "In Progress";
  return "Not Started";
}

function mapTask(
  task: TaskRecord,
  buckets: ProjectBucket[],
  milestones: ProjectMilestone[],
  tags: string[] = [],
): ProjectTask | null {
  const id = Number(task.taskId);
  if (!Number.isSafeInteger(id)) return null;

  return {
    id,
    isFinished: task.completePercentage === 100,
    subject: task.title,
    bucket: buckets.find((bucket) => bucket.id === task.bucketId)?.name,
    status:
      buckets.find((bucket) => bucket.id === task.bucketId)?.name ??
      fallbackBucketName(task.statusId),
    dueDate: task.dueDate ?? "",
    priority: taskPriorityLabels[task.priorityId] ?? "Medium",
    documentPageLink: "/task-document",
    tags,
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
  const [tagsByTaskId, setTagsByTaskId] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    setRecords([]);
    setTagsByTaskId({});
    setProjectTasks([]);
    if (!workspaceId) return () => { cancelled = true; };

    void taskApi.list(workspaceId).then(async (tasks) => {
      const tagEntries = await Promise.all(
        tasks.map(async (task) => [
          task.taskId,
          (await tagBindApi.listByTask(task.taskId)).map((tag) => tag.name),
        ] as const),
      );
      if (!cancelled) {
        setRecords(tasks);
        setTagsByTaskId(Object.fromEntries(tagEntries));
      }
    }).catch(() => {
      if (!cancelled) setRecords([]);
    });
    return () => { cancelled = true; };
  }, [workspaceId]);

  useEffect(() => {
    const mappedTasks = records.flatMap((record) => {
      const task = mapTask(record, buckets, milestones, tagsByTaskId[record.taskId]);
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
  }, [buckets, milestones, records, tagsByTaskId]);

  return { projectTasks, setProjectTasks };
}

export function useTaskTags(_options?: { taskId?: ProjectTaskId }) {
  const [tags, setTags] = useState<string[]>([]);
  return { setTags, tags };
}

export function useTasks({ taskId }: { taskId: ProjectTaskId }) {
  const [task, setTask] = useState<ProjectTask>();
  const [buckets, setBuckets] = useState<ProjectBucket[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
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
    void taskApi.getById(String(taskId)).then(async (record) => {
      if (!record) return { record, buckets: [], milestones: [], tags: [] };
      const [bucketRecords, milestoneRecords, tagRecords] = await Promise.all([
        bucketApi.list(record.workspaceId),
        milestoneApi.list(record.workspaceId),
        tagBindApi.listByTask(record.taskId),
      ]);
      return {
        record,
        buckets: bucketRecords.map((item) => ({
          id: item.bucketId, name: item.name, order: item.displayOrder,
          status: item.statusType,
        })),
        milestones: milestoneRecords.map((item) => ({
          id: item.milestoneId, name: item.name,
        })),
        tags: tagRecords.map((tag) => tag.name),
      };
    }).then((result) => {
      if (cancelled) return;
      setBuckets(result.buckets);
      setMilestones(result.milestones);
      setTask(result.record
        ? mapTask(result.record, result.buckets, result.milestones, result.tags) ?? undefined
        : undefined);
    }).catch(() => {
      if (!cancelled) {
        setBuckets([]);
        setMilestones([]);
        setTask(undefined);
      }
    });
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
