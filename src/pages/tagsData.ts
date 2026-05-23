export type TagLinkedSet = {
  id: string;
  task: string;
  wikiSet: string;
};

export type TagLinkedWiki = {
  id: string;
  title: string;
  scope: string;
};

export type TagColorName =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Lime"
  | "Green"
  | "Light Blue"
  | "Blue"
  | "Navy"
  | "Purple"
  | "Pink"
  | "White"
  | "Gray"
  | "Brown"
  | "Dark Gray";

export type TagColor = {
  name: TagColorName;
  value: string;
  backgroundValue: string;
};

export type TagRecord = {
  id: string;
  name: string;
  color: TagColorName;
  description: string;
  lastUsed: string;
  linkedSets: TagLinkedSet[];
  linkedWikis: TagLinkedWiki[];
};

export const tagColors: TagColor[] = [
  { name: "Red", value: "#ef4444", backgroundValue: "#fee2e2" },
  { name: "Orange", value: "#f97316", backgroundValue: "#ffedd5" },
  { name: "Yellow", value: "#eab308", backgroundValue: "#fef9c3" },
  { name: "Lime", value: "#84cc16", backgroundValue: "#ecfccb" },
  { name: "Green", value: "#22c55e", backgroundValue: "#dcfce7" },
  { name: "Light Blue", value: "#38bdf8", backgroundValue: "#e0f2fe" },
  { name: "Blue", value: "#3b82f6", backgroundValue: "#dbeafe" },
  { name: "Navy", value: "#1e3a8a", backgroundValue: "#dbeafe" },
  { name: "Purple", value: "#8b5cf6", backgroundValue: "#ede9fe" },
  { name: "Pink", value: "#ec4899", backgroundValue: "#fce7f3" },
  { name: "White", value: "#d1d5db", backgroundValue: "#ffffff" },
  { name: "Gray", value: "#6b7280", backgroundValue: "#f3f4f6" },
  { name: "Brown", value: "#92400e", backgroundValue: "#fef3c7" },
  { name: "Dark Gray", value: "#374151", backgroundValue: "#e5e7eb" },
];

const tagNames = [
  "api",
  "architecture",
  "backend",
  "bug",
  "design",
  "desktop",
  "documentation",
  "frontend",
  "high-priority",
  "integration",
  "mobile",
  "performance",
  "planning",
  "release",
  "research",
  "security",
  "testing",
  "ui",
  "ux",
  "wiki",
];

export const tags: TagRecord[] = Array.from({ length: 126 }, (_, index) => {
  const serial = index + 1;
  const baseName = tagNames[index % tagNames.length];
  const phase = Math.floor(index / tagNames.length) + 1;

  return {
    id: `tag-${serial}`,
    name: `${baseName}-${phase}`,
    color: tagColors[index % tagColors.length].name,
    description: `Tag used for ${baseName} work in phase ${phase}.`,
    lastUsed: `2026-05-${String(23 - (index % 14)).padStart(2, "0")}`,
    linkedSets: [
      {
        id: `set-${serial}-1`,
        task: `Task ${String(serial).padStart(3, "0")} implementation`,
        wikiSet: "ManageMe Core Wiki Set",
      },
      {
        id: `set-${serial}-2`,
        task: `Task ${String(serial).padStart(3, "0")} review`,
        wikiSet: "Requirements Wiki Set",
      },
    ],
    linkedWikis: [
      {
        id: `wiki-${serial}-1`,
        title: `${baseName}-notes-${phase}`,
        scope: "Project Wiki",
      },
      {
        id: `wiki-${serial}-2`,
        title: `${baseName}-decision-log-${phase}`,
        scope: "Task Wiki",
      },
    ],
  };
});
