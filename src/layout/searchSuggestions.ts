export type SearchSuggestionKind = "project" | "document";

export type SearchSuggestion = {
  id: string;
  kind: SearchSuggestionKind;
  title: string;
  scope: string;
  excerpt: string;
  keywords: string[];
};

export const searchSuggestions: SearchSuggestion[] = [
  {
    id: "project-manageme-core",
    kind: "project",
    title: "ManageMe Core",
    scope: "Project",
    excerpt: "Task management workspace for grid, board, document, and search flows.",
    keywords: ["project", "task", "grid", "board", "workspace", "core", "requirements", "ui", "document"],
  },
  {
    id: "project-knowledge-document",
    kind: "project",
    title: "Knowledge Document",
    scope: "Project",
    excerpt: "Notes for document page structure, task-linked documents, and navigation.",
    keywords: ["project", "document", "notes", "document", "navigation", "requirements"],
  },
  {
    id: "project-desktop-shell",
    kind: "project",
    title: "Desktop Shell",
    scope: "Project",
    excerpt: "Tauri shell planning, local app behavior, theme, and window settings.",
    keywords: ["project", "desktop", "tauri", "settings", "theme"],
  },
  {
    id: "document-detailed-requirements",
    kind: "document",
    title: "ph-1-0-001-detailed-function-requirements-eng",
    scope: "Document",
    excerpt: "Functional requirements for projects, tasks, document pages, and search.",
    keywords: ["document", "requirements", "function", "task", "search", "project"],
  },
  {
    id: "document-issue-rule",
    kind: "document",
    title: "issue-rule-eng",
    scope: "Document",
    excerpt: "Issue hierarchy, branch naming, body rules, and workflow guidance.",
    keywords: ["document", "issue", "branch", "workflow", "rule"],
  },
  {
    id: "document-er-diagram",
    kind: "document",
    title: "ph-1-0-002-er-diagram-eng",
    scope: "Document",
    excerpt: "Entity relationships for project data, tasks, document pages, and attributes.",
    keywords: ["document", "er", "diagram", "entity", "task", "attribute"],
  },
];
