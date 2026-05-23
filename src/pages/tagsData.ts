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

export type TagRecord = {
  id: string;
  name: string;
  description: string;
  linkedSets: TagLinkedSet[];
  linkedWikis: TagLinkedWiki[];
};

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
    description: `Tag used for ${baseName} work in phase ${phase}.`,
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
