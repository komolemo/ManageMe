import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { ProjectTask } from "@/features/task/projectTypes";
import { DefaultCell } from "./ProjectGridRows/DefaultCell";
import { DueDateCell } from "./ProjectGridRows/DueDateCell";
import { FinishedCell } from "./ProjectGridRows/FinishedCell";
import { PriorityCell } from "./ProjectGridRows/PriorityCell";
import { ProjectTableHeader } from "./ProjectTableHeader";
import { StatusCell } from "./ProjectGridRows/StatusCell";
import { SubjectCell } from "./ProjectGridRows/SubjectCell";
import { TaskKeyCell } from "./ProjectGridRows/TaskKeyCell";

export type ProjectTableColumnKey = keyof ProjectTask | "taskKey";
export type ProjectTableColumn = { key: ProjectTableColumnKey; label: string; minWidth: number; width: string; hideHeaderText?: boolean; render?: (task: ProjectTask) => ReactNode };

const columns: ProjectTableColumn[] = [
  { key: "isFinished", label: "IsFinished", minWidth: 64, width: "64px", hideHeaderText: true },
  { key: "taskKey", label: "Task Key", minWidth: 140, width: "140px" },
  { key: "subject", label: "Subject", minWidth: 480, width: "minmax(480px, 1.4fr)" },
  { key: "status", label: "Status", minWidth: 120, width: "120px" },
  { key: "dueDate", label: "Due Date", minWidth: 140, width: "140px" },
  { key: "priority", label: "Priority", minWidth: 100, width: "100px" },
  { key: "documentPageLink", label: "Document Page", minWidth: 180, width: "minmax(180px, 1fr)", render: (task) => <a className="min-w-0 truncate text-primary underline-offset-4 hover:underline" href={task.documentPageLink}>{task.documentPageLink}</a> },
  { key: "milestone", label: "Milestone", minWidth: 120, width: "120px" },
];
const columnByKey = new Map(columns.map((column) => [column.key, column]));
const backgrounds = ["bg-[oklch(0.94_0_0)] dark:bg-[oklch(0.205_0_0)]", "bg-[oklch(0.965_0_0)] dark:bg-[oklch(0.265_0_0)]", "bg-[oklch(0.985_0_0)] dark:bg-[oklch(0.335_0_0)]"];

function flattenRows(tasks: ProjectTask[], expanded: Set<ProjectTask["id"]>, depth = 0): { depth: number; task: ProjectTask }[] {
  return tasks.flatMap((task) => task.children?.length && expanded.has(task.id)
    ? [{ depth, task }, ...flattenRows(task.children, expanded, depth + 1)]
    : [{ depth, task }]);
}

type Props = { bucketNames: string[]; onOpenTaskInNewTab: (task: ProjectTask) => void; onOpenTaskDetails: (task: ProjectTask) => void; tasks: ProjectTask[] };

export function ProjectTable({ bucketNames, onOpenTaskInNewTab, onOpenTaskDetails, tasks }: Props) {
  const { t, i18n } = useTranslation();
  const [columnOrder, setColumnOrder] = useState<ProjectTableColumnKey[]>(() => columns.map(({ key }) => key));
  const [expanded, setExpanded] = useState<Set<ProjectTask["id"]>>(() => new Set());
  const orderedColumns = useMemo(() => columnOrder.flatMap((key) => {
    const column = columnByKey.get(key);
    if (!column) return [];
    const labelKey = ({ isFinished: "finished", taskKey: "taskKey", subject: "subject", status: "status", dueDate: "dueDate", priority: "priority", documentPageLink: "documentPage", milestone: "milestone" } as Partial<Record<ProjectTableColumnKey, string>>)[key];
    return [{ ...column, label: labelKey ? t(`columns.${labelKey}`) : column.label }];
  }), [columnOrder, i18n.resolvedLanguage, t]);
  const minWidth = useMemo(() => orderedColumns.reduce((sum, column) => sum + column.minWidth, 0), [orderedColumns]);
  const rows = useMemo(() => flattenRows(tasks, expanded), [expanded, tasks]);
  const toggleExpansion = (taskId: ProjectTask["id"]) => setExpanded((current) => {
    const next = new Set(current);
    next.has(taskId) ? next.delete(taskId) : next.add(taskId);
    return next;
  });
  return (
    <div className="min-h-0 flex-1 basis-0 overflow-hidden [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overflow-auto">
      <Table className="table-fixed" style={{ minWidth: `${minWidth}px` }}>
        <colgroup>
          {orderedColumns.map((column) => <col key={column.key} style={{ width: `${column.minWidth}px` }} />)}
        </colgroup>
        <ProjectTableHeader columns={orderedColumns} onColumnOrderChange={setColumnOrder} />
        <TableBody>
        {rows.map(({ depth, task }) => <TableRow className={`hover:bg-accent hover:text-accent-foreground ${backgrounds[Math.min(depth, backgrounds.length - 1)]}`} key={task.id}>
          {orderedColumns.map((column) => 
            <ProjectTableCell columnKey={column.key} key={column.key}>
              {
                  column.key === "isFinished" ? <FinishedCell isExpanded={expanded.has(task.id)} onToggleExpansion={toggleExpansion} task={task} />
                : column.key === "status" ? <StatusCell bucketNames={bucketNames} task={task} />
                : column.key === "priority" ? <PriorityCell task={task} />
                : column.key === "dueDate" ? <DueDateCell task={task} />
                : column.key === "subject" ? <SubjectCell depth={depth} onOpenTaskDetails={onOpenTaskDetails} onOpenTaskInNewTab={onOpenTaskInNewTab} task={task} />
                : column.key === "taskKey" ? <TaskKeyCell task={task} />
                : <DefaultCell column={column} task={task} />
              }
            </ProjectTableCell>
          )}
        </TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectTableCell({ children, columnKey }: { children: ReactNode; columnKey: ProjectTableColumnKey }) {
  const overflow = columnKey === "subject" || columnKey === "taskKey" ? "overflow-hidden" : "";
  return <TableCell className={`h-[32px] min-w-0 px-[10px] py-[4px] ${overflow}`}>{children}</TableCell>;
}
