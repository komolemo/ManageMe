import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectTask } from "@/pages/projectData";

type GridColumn = {
  key: keyof ProjectTask;
  label: string;
  minWidth: number;
  width: string;
  hideHeaderText?: boolean;
  render?: (task: ProjectTask) => ReactNode;
};

const columns: GridColumn[] = [
  {
    key: "isFinished",
    label: "IsFinished",
    minWidth: 48,
    width: "48px",
    hideHeaderText: true,
    render: (task) => (
      <Checkbox
        checked={task.isFinished}
      />
    ),
  },
  {
    key: "subject",
    label: "Subject",
    minWidth: 220,
    width: "minmax(220px, 1.4fr)",
    render: (task) => <span className="truncate font-medium">{task.subject}</span>,
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
    key: "details",
    label: "Details",
    minWidth: 280,
    width: "minmax(280px, 2fr)",
  },
];

const gridTemplateColumns = columns.map((column) => column.width).join(" ");
const gridMinWidth = columns.reduce((total, column) => total + column.minWidth, 0);

type ProjectGridViewProps = {
  tasks: ProjectTask[];
};

export function ProjectGridView({ tasks }: ProjectGridViewProps) {
  return (
    <div className="max-w-full overflow-x-auto border bg-card">
      <div style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}>
        <div
          className="grid border-b bg-muted text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
          {columns.map((column) => (
            <div
              className="min-w-0 whitespace-nowrap px-[12px] py-[10px]"
              key={column.key}
            >
              {column.hideHeaderText ? (
                <span className="sr-only">{column.label}</span>
              ) : (
                column.label
              )}
            </div>
          ))}
        </div>

        <div className="grid">
          {tasks.map((task) => (
            <div
              className="grid border-b text-xs last:border-b-0 hover:bg-accent hover:text-accent-foreground"
              key={task.id}
              style={{ gridTemplateColumns }}
            >
              {columns.map((column) => (
                <div
                  className="flex min-w-0 items-center whitespace-nowrap px-[12px] py-[10px]"
                  key={column.key}
                >
                  {column.render ? column.render(task) : String(task[column.key])}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
