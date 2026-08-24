export type TaskStatus = "Not Started" | "In Progress" | "Review" | "Completed" | "Closed";
export type BucketStatus = 0 | 50 | 100;

export const maxTaskTags = 10;
export const projectKey = "TEST_PROJECT";
export type ProjectTaskId = number;
export type ProjectTaskKey = `${typeof projectKey}-${ProjectTaskId}`;

export function formatProjectTaskKey(taskId: ProjectTaskId): ProjectTaskKey {
  return `${projectKey}-${taskId}`;
}

export type TaskTags =
  | []
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string]
  | [string, string, string, string, string, string]
  | [string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string, string]
  | [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string
    ];

export type ProjectTask = {
  id: ProjectTaskId;
  isFinished: boolean;
  subject: string;
  bucket?: string;
  status: TaskStatus;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
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

export const boardStatuses: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Review",
  "Completed",
  "Closed",
];

export const defaultProjectBuckets: ProjectBucket[] = [
  { id: "backlog", name: "Backlog", order: 1, status: 0 },
  { id: "waiting-review", name: "Review", order: 2, status: 50 },
  { id: "done", name: "Done", order: 3, status: 100 },
];

export const defaultProjectMilestones: ProjectMilestone[] = [
  { id: "ph-1-0", name: "ph-1-0" },
  { id: "ph-1-1", name: "ph-1-1" },
  { id: "ph-1-2", name: "ph-1-2" },
  { id: "ph-1-3", name: "ph-1-3" },
  { id: "ph-1-4", name: "ph-1-4" },
  { id: "ph-1-5", name: "ph-1-5" },
];

export const tasks: ProjectTask[] = [
  {
    id: 101,
    isFinished: true,
    subject: "Reflect issue hierarchy rules in the UI",
    status: "Not Started",
    dueDate: "05/24",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["requirements", "document", "planning", "test1", "test2", "test3", "test4", "test5", "test6", "test7"],
    milestone: "ph-1-0",
    details: "Organize the relationship between Project Document and Task Document.",
    children: [
      {
        id: 102,
        isFinished: true,
        subject: "Define parent and child task display rules",
        status: "Review",
        dueDate: "05/22",
        priority: "Medium",
        documentPageLink: "/task-document",
        tags: ["requirements", "grid"],
        milestone: "ph-1-0",
        details: "Clarify how nested tasks appear in the project grid.",
      },
      {
        id: 103,
        isFinished: true,
        subject: "Check expansion behavior with nested records",
        status: "In Progress",
        dueDate: "05/23",
        priority: "Medium",
        documentPageLink: "/task-document",
        tags: ["grid", "qa"],
        milestone: "ph-1-0",
        details: "Verify that child task rows are shown only when expanded.",
        children: [
          {
            id: 104,
            isFinished: false,
            subject: "Verify grandchild row notation",
            status: "Not Started",
            dueDate: "05/24",
            priority: "Low",
            documentPageLink: "/task-document",
            tags: ["grid", "qa"],
            milestone: "ph-1-0",
            details:
              "Confirm that grandchild task rows use the expected hierarchy marker.",
          },
        ],
      },
      {
        id: 105,
        isFinished: true,
        subject: "task-1-child-3",
        status: "Review",
        dueDate: "05/22",
        priority: "Medium",
        documentPageLink: "/task-document",
        tags: ["requirements", "grid"],
        milestone: "ph-1-0",
        details: "Clarify how nested tasks appear in the project grid.",
      },
      {
        id: 106,
        isFinished: true,
        subject: "task-1-child-4",
        status: "Review",
        dueDate: "05/22",
        priority: "Medium",
        documentPageLink: "/task-document",
        tags: ["requirements", "grid"],
        milestone: "ph-1-0",
        details: "Clarify how nested tasks appear in the project grid.",
      },
    ],
  },
  {
    id: 107,
    isFinished: false,
    subject: "Project list screen",
    status: "In Progress",
    dueDate: "05/27",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["ui", "navigation"],
    milestone: "ph-1-0",
    details: "Create a UI that navigates from the list to each project page.",
  },
  {
    id: 108,
    isFinished: false,
    subject: "Document Markdown input",
    status: "Review",
    dueDate: "05/30",
    priority: "Medium",
    documentPageLink: "/task-document",
    tags: ["document", "markdown", "editor"],
    milestone: "ph-1-1",
    details: "Place a Markdown input area on the Task Page.",
  },
  {
    id: 109,
    isFinished: false,
    subject: "Board view layout",
    status: "In Progress",
    dueDate: "06/02",
    priority: "Low",
    documentPageLink: "/project-document",
    tags: ["board", "layout"],
    milestone: "ph-1-1",
    details: "Show task cards grouped by status in board columns.",
  },
  {
    id: 110,
    isFinished: false,
    subject: "Task detail drawer",
    status: "Not Started",
    dueDate: "06/04",
    priority: "High",
    documentPageLink: "/task-document",
    tags: ["task", "detail", "drawer"],
    milestone: "ph-1-1",
    details: "Design a compact task detail drawer for quick edits.",
  },
  {
    id: 111,
    isFinished: false,
    subject: "Project dashboard metrics",
    status: "In Progress",
    dueDate: "06/06",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["dashboard", "metrics", "project"],
    milestone: "ph-1-1",
    details: "Add summary metrics for open tasks, reviews, and due dates.",
  },
  {
    id: 112,
    isFinished: true,
    subject: "Settings theme toggle",
    status: "Review",
    dueDate: "06/08",
    priority: "Low",
    documentPageLink: "/project-document",
    tags: ["settings", "theme"],
    milestone: "ph-1-1",
    details: "Review the theme toggle behavior in settings.",
  },
  {
    id: 113,
    isFinished: false,
    subject: "Tag search result filters",
    status: "Not Started",
    dueDate: "06/10",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["tag", "search", "filters"],
    milestone: "ph-1-2",
    details: "Let users narrow search results by tag, status, and priority.",
  },
  {
    id: 114,
    isFinished: false,
    subject: "Document link preview",
    status: "In Progress",
    dueDate: "06/12",
    priority: "Medium",
    documentPageLink: "/task-document",
    tags: ["document", "preview", "links"],
    milestone: "ph-1-2",
    details: "Show a lightweight preview when hovering over document links.",
  },
  {
    id: 115,
    isFinished: false,
    subject: "Milestone progress indicator",
    status: "Review",
    dueDate: "06/14",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["milestone", "progress", "status"],
    milestone: "ph-1-2",
    details: "Add milestone progress based on completed and review tasks.",
  },
  {
    id: 116,
    isFinished: false,
    subject: "Bulk task selection",
    status: "Not Started",
    dueDate: "06/16",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["bulk", "selection", "grid"],
    milestone: "ph-1-2",
    details: "Support selecting multiple tasks from the grid view.",
  },
  {
    id: 117,
    isFinished: true,
    subject: "Sidebar keyboard navigation",
    status: "Review",
    dueDate: "06/18",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["sidebar", "keyboard", "accessibility"],
    milestone: "ph-1-2",
    details: "Validate keyboard navigation through sidebar destinations.",
  },
  {
    id: 118,
    isFinished: false,
    subject: "Task document autosave",
    status: "In Progress",
    dueDate: "06/20",
    priority: "High",
    documentPageLink: "/task-document",
    tags: ["document", "autosave", "editor"],
    milestone: "ph-1-3",
    details: "Persist task document edits automatically after short idle periods.",
  },
  {
    id: 119,
    isFinished: false,
    subject: "Project document table of contents",
    status: "Not Started",
    dueDate: "06/22",
    priority: "Low",
    documentPageLink: "/project-document",
    tags: ["document", "toc", "navigation"],
    milestone: "ph-1-3",
    details: "Generate a table of contents from project document headings.",
  },
  {
    id: 120,
    isFinished: false,
    subject: "Due date quick presets",
    status: "In Progress",
    dueDate: "06/24",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["due-date", "calendar", "presets"],
    milestone: "ph-1-3",
    details: "Add quick due date options such as today, tomorrow, and next week.",
  },
  {
    id: 121,
    isFinished: false,
    subject: "Priority color audit",
    status: "Review",
    dueDate: "06/26",
    priority: "Low",
    documentPageLink: "/project-document",
    tags: ["priority", "color", "accessibility"],
    milestone: "ph-1-3",
    details: "Check priority colors for contrast in light and dark themes.",
  },
  {
    id: 122,
    isFinished: false,
    subject: "Project export workflow",
    status: "Completed",
    dueDate: "06/28",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["export", "project", "workflow"],
    milestone: "ph-1-4",
    details: "Define how project data can be exported for backup or sharing.",
  },
  {
    id: 123,
    isFinished: true,
    subject: "Empty state polish",
    status: "Review",
    dueDate: "06/30",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["empty-state", "ui", "polish"],
    milestone: "ph-1-4",
    details: "Improve empty states across project, tag, and search pages.",
  },
  {
    id: 124,
    isFinished: false,
    subject: "Notification preference panel",
    status: "In Progress",
    dueDate: "07/02",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["notifications", "settings", "preferences"],
    milestone: "ph-1-4",
    details: "Create notification preference controls in the settings page.",
  },
  {
    id: 125,
    isFinished: false,
    subject: "Tag color migration plan",
    status: "Not Started",
    dueDate: "07/04",
    priority: "Low",
    documentPageLink: "/project-document",
    tags: ["tag", "color", "migration"],
    milestone: "ph-1-4",
    details: "Plan how existing tag colors should migrate to the new palette.",
  },
  {
    id: 126,
    isFinished: false,
    subject: "Search ranking tuning",
    status: "Closed",
    dueDate: "07/06",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["search", "ranking", "relevance"],
    milestone: "ph-1-5",
    details: "Tune search ranking so exact title matches appear first.",
  },
  {
    id: 127,
    isFinished: false,
    subject: "Task activity timeline",
    status: "Not Started",
    dueDate: "07/08",
    priority: "Medium",
    documentPageLink: "/task-document",
    tags: ["activity", "timeline", "task"],
    milestone: "ph-1-5",
    details: "Show task changes and comments in a chronological timeline.",
  },
  {
    id: 128,
    isFinished: true,
    subject: "Responsive grid check",
    status: "Review",
    dueDate: "07/10",
    priority: "Medium",
    documentPageLink: "/project-document",
    tags: ["responsive", "grid", "qa"],
    milestone: "ph-1-5",
    details: "Check the grid layout across desktop and narrow viewports.",
  },
  {
    id: 129,
    isFinished: false,
    subject: "Release checklist draft",
    status: "Not Started",
    dueDate: "07/12",
    priority: "High",
    documentPageLink: "/project-document",
    tags: ["release", "checklist", "planning"],
    milestone: "ph-1-5",
    details: "Draft the release checklist for the first ManageMe milestone.",
  },
];
