export type TaskStatus = "Not Started" | "In Progress" | "Review";

export type ProjectTask = {
  id: string;
  isFinished: boolean;
  subject: string;
  status: TaskStatus;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  wikiPageLink: string;
  tag: string;
  milestone: string;
  details: string;
};

export const boardStatuses: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Review",
];

export const tasks: ProjectTask[] = [
  {
    id: "task-1",
    isFinished: true,
    subject: "Reflect issue hierarchy rules in the UI",
    status: "Not Started",
    dueDate: "2026-05-24",
    priority: "High",
    wikiPageLink: "/project-wiki",
    tag: "requirements",
    milestone: "ph-1-0",
    details: "Organize the relationship between Project Wiki and Task Wiki.",
  },
  {
    id: "task-2",
    isFinished: false,
    subject: "Project list screen",
    status: "In Progress",
    dueDate: "2026-05-27",
    priority: "Medium",
    wikiPageLink: "/project-wiki",
    tag: "ui",
    milestone: "ph-1-0",
    details: "Create a UI that navigates from the list to each project page.",
  },
  {
    id: "task-3",
    isFinished: false,
    subject: "Wiki Markdown input",
    status: "Review",
    dueDate: "2026-05-30",
    priority: "Medium",
    wikiPageLink: "/task-wiki",
    tag: "wiki",
    milestone: "ph-1-1",
    details: "Place a Markdown input area on the Task Page.",
  },
  {
    id: "task-4",
    isFinished: false,
    subject: "Board view layout",
    status: "In Progress",
    dueDate: "2026-06-02",
    priority: "Low",
    wikiPageLink: "/project-wiki",
    tag: "board",
    milestone: "ph-1-1",
    details: "Show task cards grouped by status in board columns.",
  },
];
