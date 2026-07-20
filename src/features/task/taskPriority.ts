export const TASK_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  EMERGENCY: 3,
} as const;

export type TaskPriorityId =
  (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export type TaskPriorityLabel =
  | "Low"
  | "Medium"
  | "High"
  | "Emergency";

export const taskPriorityOptions: ReadonlyArray<{
  id: TaskPriorityId;
  label: TaskPriorityLabel;
}> = [
  { id: TASK_PRIORITY.LOW, label: "Low" },
  { id: TASK_PRIORITY.MEDIUM, label: "Medium" },
  { id: TASK_PRIORITY.HIGH, label: "High" },
  { id: TASK_PRIORITY.EMERGENCY, label: "Emergency" },
];

export const taskPriorityLabels = taskPriorityOptions.map(
  ({ label }) => label,
);
