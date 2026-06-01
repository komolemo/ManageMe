export type SearchSuggestionKind = "project" | "wiki";

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
    excerpt: "Task management workspace for grid, board, wiki, and search flows.",
    keywords: ["project", "task", "grid", "board", "workspace", "core", "requirements", "ui", "wiki"],
  },
  {
    id: "project-knowledge-wiki",
    kind: "project",
    title: "Knowledge Wiki",
    scope: "Project",
    excerpt: "Notes for wiki page structure, task-linked documents, and navigation.",
    keywords: ["project", "wiki", "notes", "document", "navigation", "requirements"],
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
    id: "wiki-detailed-requirements",
    kind: "wiki",
    title: "ph-1-0-001-detailed-function-requirements-eng",
    scope: "Wiki",
    excerpt: "Functional requirements for projects, tasks, wiki pages, and search.",
    keywords: ["wiki", "requirements", "function", "task", "search", "project"],
  },
  {
    id: "wiki-issue-rule",
    kind: "wiki",
    title: "issue-rule-eng",
    scope: "Wiki",
    excerpt: "Issue hierarchy, branch naming, body rules, and workflow guidance.",
    keywords: ["wiki", "issue", "branch", "workflow", "rule"],
  },
  {
    id: "wiki-er-diagram",
    kind: "wiki",
    title: "ph-1-0-002-er-diagram-eng",
    scope: "Wiki",
    excerpt: "Entity relationships for project data, tasks, wiki pages, and attributes.",
    keywords: ["wiki", "er", "diagram", "entity", "task", "attribute"],
  },
];
