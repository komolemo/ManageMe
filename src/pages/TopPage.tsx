import { useState } from "react";
import { FileText, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import type { ProjectTask } from "@/pages/projectData";

type TopPageProps = {
  onNavigate: (page: PageKey) => void;
  tasks: ProjectTask[];
};

type HomeTab = "workplaces" | "recent";

const workplaces = [
  {
    id: "manageme-core",
    title: "ManageMe Core",
    description: "Tasks and documents for the MVP workspace.",
    taskCount: 12,
    documentCount: 4,
    updatedAt: "Today",
  },
  {
    id: "knowledge-wiki",
    title: "Knowledge Wiki",
    description: "Shared document and task notes.",
    taskCount: 7,
    documentCount: 6,
    updatedAt: "Yesterday",
  },
  {
    id: "desktop-shell",
    title: "Desktop Shell",
    description: "Desktop app workflow and shell tasks.",
    taskCount: 5,
    documentCount: 3,
    updatedAt: "2 days ago",
  },
];

const documentUpdates = [
  {
    title: "ManageMe Wiki",
    description: "TOP page requirements were organized.",
    time: "Today",
  },
  {
    title: "Requirements Wiki",
    description: "Document navigation notes were updated.",
    time: "Yesterday",
  },
  {
    title: "Design Wiki",
    description: "Sidebar document tree behavior was reviewed.",
    time: "2 days ago",
  },
];

export function TopPage({ onNavigate, tasks }: TopPageProps) {
  const [selectedTab, setSelectedTab] = useState<HomeTab>("workplaces");
  const revisionHistory = [
    ...flattenTasks(tasks)
      .slice(0, 5)
      .map((task) => ({
        description: `${task.status} / ${task.milestone}`,
        id: `task-${task.id}`,
        kind: "課題" as const,
        time: task.dueDate,
        title: task.subject,
      })),
    ...documentUpdates.map((document) => ({
      description: document.description,
      id: `document-${document.title}`,
      kind: "文書" as const,
      time: document.time,
      title: document.title,
    })),
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: "TOP" }]}
      detailSidebar={<TopDetailSidebar onNavigate={onNavigate} />}
    >
      <div
        className="grid gap-[16px]"
        style={{ marginInline: "auto", width: "min(100%, 640px)" }}
      >
        <h1 className="m-0 text-[24px] font-semibold flex justify-center">こんにちは！今日も頑張っていますね！</h1>

        <div className="grid gap-[8px]">
          <div className="grid h-[32px] w-full grid-cols-2" role="tablist">
            <HomeTabButton
              isSelected={selectedTab === "workplaces"}
              onClick={() => setSelectedTab("workplaces")}
            >
              Workplace List
            </HomeTabButton>
            <HomeTabButton
              isSelected={selectedTab === "recent"}
              onClick={() => setSelectedTab("recent")}
            >
              Sorted by Date
            </HomeTabButton>
          </div>

          {selectedTab === "workplaces" ? (
            <div className="grid">
              {workplaces.map((workplace) => (
                <WorkplaceItem
                  key={workplace.id}
                  onNavigate={onNavigate}
                  workplace={workplace}
                />
              ))}
            </div>
          ) : null}

          {selectedTab === "recent" ? (
            <div className="grid">
              {revisionHistory.map((history) => (
                <HistoryItem
                  description={history.description}
                  key={history.id}
                  kind={history.kind}
                  time={history.time}
                  title={history.title}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

function HomeTabButton({
  children,
  isSelected,
  onClick,
}: {
  children: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-selected={isSelected}
      className="h-[32px] cursor-pointer border-0 bg-transparent px-[8px] text-xs font-medium text-foreground/70 hover:text-foreground"
      onClick={onClick}
      role="tab"
      style={{
        borderBottom: isSelected
          ? "2px solid var(--foreground)"
          : "2px solid transparent",
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function TopDetailSidebar({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  return (
    <div className="grid gap-[8px]">
      <button
        className="flex h-[36px] cursor-pointer items-center gap-[8px] rounded-lg border-0 bg-transparent px-[8px] text-left text-xs text-sidebar-foreground hover:bg-accent-2 hover:text-sidebar-accent-foreground"
        onClick={() => onNavigate("projects")}
        type="button"
      >
        <ListTodo className="size-4" />
        <span>課題一覧</span>
      </button>
      <button
        className="flex h-[36px] cursor-pointer items-center gap-[8px] rounded-lg border-0 bg-transparent px-[8px] text-left text-xs text-sidebar-foreground hover:bg-accent-2 hover:text-sidebar-accent-foreground"
        onClick={() => onNavigate("projectWikiList")}
        type="button"
      >
        <FileText className="size-4" />
        <span>文書一覧</span>
      </button>
    </div>
  );
}

function WorkplaceItem({
  onNavigate,
  workplace,
}: {
  onNavigate: (page: PageKey) => void;
  workplace: (typeof workplaces)[number];
}) {
  return (
    <Card>
      <CardContent className="grid gap-[8px] p-[12px]">
        <div className="flex min-w-0 items-center justify-between gap-[8px]">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{workplace.title}</div>
            <p className="m-0 truncate text-xs text-muted-foreground">
              {workplace.description}
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {workplace.updatedAt}
          </span>
        </div>
        <div className="flex flex-wrap gap-[6px]">
          <button
            className="cursor-pointer rounded-md border bg-transparent px-[8px] py-[4px] text-xs hover:bg-accent hover:text-accent-foreground"
            onClick={() => onNavigate("projects")}
            type="button"
          >
            課題 {workplace.taskCount}
          </button>
          <button
            className="cursor-pointer rounded-md border bg-transparent px-[8px] py-[4px] text-xs hover:bg-accent hover:text-accent-foreground"
            onClick={() => onNavigate("projectWikiList")}
            type="button"
          >
            文書 {workplace.documentCount}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryItem({
  description,
  kind,
  time,
  title,
}: {
  description: string;
  kind: "課題" | "文書";
  time: string;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="grid gap-[2px] p-[12px]">
        <div className="flex min-w-0 items-center justify-between gap-[8px]">
          <span className="flex min-w-0 items-center gap-[6px]">
            <Badge className="h-[18px] shrink-0 px-[6px] text-[10px]" variant="outline">
              {kind}
            </Badge>
            <span className="min-w-0 truncate text-xs font-semibold">
              {title}
            </span>
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {time}
          </span>
        </div>
        <p className="m-0 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function flattenTasks(tasks: ProjectTask[]): ProjectTask[] {
  return tasks.flatMap((task) => [task, ...flattenTasks(task.children ?? [])]);
}
