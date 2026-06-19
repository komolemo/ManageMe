import { FileText } from "lucide-react";
import { PageShell } from "@/pages/PageShell";

type WikiPageNode = {
  title: string;
  children?: WikiPageNode[];
};

const wikiPages: WikiPageNode[] = [
  {
    title: "ph-1-0-001-detailed-function-requirements-eng",
    children: [
      {
        title: "ph-1-0-001-api-contract-eng",
        children: [{ title: "ph-1-0-001-task-status-model-eng" }],
      },
      { title: "ph-1-0-001-screen-flow-eng" },
    ],
  },
  {
    title: "ph-1-0-002-er-diagram-eng",
    children: [{ title: "ph-1-0-002-entity-notes-eng" }],
  },
  {
    title: "issue-rule-eng",
  },
];

type ProjectWikiPageProps = {
  wikiTitle?: string;
};

export function ProjectWikiPage({
  wikiTitle = "Project Wiki",
}: ProjectWikiPageProps) {
  return (
    <PageShell breadcrumbs={[{ label: "Wiki" }, { label: wikiTitle }]}>
      <div className="grid gap-2">
        {wikiPages.map((page) => (
          <WikiPageTreeItem key={page.title} node={page} level={0} />
        ))}
      </div>
    </PageShell>
  );
}

function WikiPageTreeItem({
  node,
  level,
}: {
  node: WikiPageNode;
  level: number;
}) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className="grid gap-1">
      <button
        className="border border-border bg-card text-left text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        type="button"
      >
        <div
          className="flex items-center"
          style={{ marginLeft: `${level * 12}px` }}
        >
          <FileText className="mr-2 size-4 text-current" />
          <span className="text-sm font-medium">{node.title}</span>
        </div>
      </button>

      {hasChildren &&
        node.children?.map((child) => (
          <WikiPageTreeItem
            key={child.title}
            node={child}
            level={level + 1}
          />
        ))}
    </div>
  );
}
