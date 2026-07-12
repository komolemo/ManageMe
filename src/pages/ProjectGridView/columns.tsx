import type { ProjectTask } from "@/pages/projectData";
import type { GridColumn } from "@/pages/ProjectGridView/types";

export const columns: GridColumn[] = [
  {
    key: "isFinished",
    label: "IsFinished",
    minWidth: 64,
    width: "64px",
    hideHeaderText: true,
  },
  {
    key: "taskKey",
    label: "Task Key",
    minWidth: 140,
    width: "140px",
  },
  {
    key: "subject",
    label: "Subject",
    minWidth: 480,
    width: "minmax(480px, 1.4fr)",
  },
  {
    key: "status",
    label: "Status",
    minWidth: 120,
    width: "120px",
  },
  {
    key: "dueDate",
    label: "Due Date",
    minWidth: 140,
    width: "140px",
  },
  {
    key: "priority",
    label: "Priority",
    minWidth: 100,
    width: "100px",
  },
  {
    key: "documentPageLink",
    label: "Document Page",
    minWidth: 180,
    width: "minmax(180px, 1fr)",
    render: (task: ProjectTask) => (
      <a
        className="min-w-0 truncate text-primary underline-offset-4 hover:underline"
        href={task.documentPageLink}
      >
        {task.documentPageLink}
      </a>
    ),
  },
  {
    key: "milestone",
    label: "Milestone",
    minWidth: 120,
    width: "120px",
  },
];

export const initialColumnOrder = columns.map((column) => column.key);
export const columnByKey = new Map(
  columns.map((column) => [column.key, column])
);
