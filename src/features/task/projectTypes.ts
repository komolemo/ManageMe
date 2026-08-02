import config from "@/config.json";
import type { BucketStatus } from "@/features/bucket/types";
import type { TaskPriorityLabel } from "@/features/task/taskPriority";

export type { BucketStatus } from "@/features/bucket/types";

export type BucketName = string;

export const maxTaskTags = config.maxTaskTags;
export const projectKey = "TEST_PROJECT";
export type ProjectTaskId = number;
export type ProjectTaskKey = `${typeof projectKey}-${ProjectTaskId}`;

export function formatProjectTaskKey(taskId: ProjectTaskId): ProjectTaskKey {
  return `${projectKey}-${taskId}`;
}

export type TaskTags = string[];

export type ProjectTask = {
  id: ProjectTaskId;
  isFinished: boolean;
  subject: string;
  bucket?: string;
  status: BucketName;
  dueDate: string;
  priority: TaskPriorityLabel;
  documentPageLink: string;
  tags: TaskTags;
  milestone: string;
  details: string;
  children?: ProjectTask[];
};

export type ProjectBucket = {
  id: string;
  name: string;
  order: number;
  status: BucketStatus;
};

export type ProjectMilestone = {
  id: string;
  name: string;
};
