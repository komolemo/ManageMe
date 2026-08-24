export type TaskRecord = {
  taskId: string;
  workspaceId: string;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  statusId: 0 | 50 | 100;
  priorityId: 0 | 1 | 2 | 3;
  completePercentage: number;
  milestoneId: string;
  bucketId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parentTaskId: string | null;
};
