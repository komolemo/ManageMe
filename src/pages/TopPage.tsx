import { useState } from "react";
import { FileText, ListTodo } from "lucide-react";
import { PageLink } from "@/components/app/PageLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
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
    id: "knowledge-document",
    title: "Knowledge Document",
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
  {
    id: "desktop-shell",
    title: "Desktop Shell",
    description: "Desktop app workflow and shell tasks.",
    taskCount: 5,
    documentCount: 3,
    updatedAt: "2 days ago",
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
    title: "ManageMe Document",
    description: "TOP page requirements were organized.",
    time: "Today",
  },
  {
    title: "Requirements Document",
    description: "Document navigation notes were updated.",
    time: "Yesterday",
  },
  {
    title: "Design Document",
    description: "Sidebar document tree behavior was reviewed.",
    time: "2 days ago",
  },
];

export function TopPage({ onNavigate, tasks }: TopPageProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<HomeTab>("workplaces");
  const revisionHistory = [
    ...flattenTasks(tasks)
      .slice(0, 5)
      .map((task) => ({
        id: `task-${task.id}`,
        kind: "課題" as const,
        time: task.dueDate,
        title: task.subject,
      })),
    ...documentUpdates.map((document) => ({
      id: `document-${document.title}`,
      kind: "文書" as const,
      time: document.time,
      title: document.title,
    })),
  ];

  return (
    <PageShell breadcrumbs={[{ label: t("pages.top") }]}>
      <div
        className="grid gap-[16px]"
        style={{ marginInline: "auto", width: "min(100%, 640px)" }}
      >
        <h1 className="m-0 text-[24px] font-semibold flex justify-center">{t("top.greeting")}</h1>

        <div className="grid gap-[16px]">
          <div className="grid h-[32px] w-full grid-cols-2" role="tablist">
            <HomeTabButton
              isSelected={selectedTab === "workplaces"}
              onClick={() => setSelectedTab("workplaces")}
            >
              {t("top.workplaceList")}
            </HomeTabButton>
            <HomeTabButton
              isSelected={selectedTab === "recent"}
              onClick={() => setSelectedTab("recent")}
            >
              {t("top.sortedByDate")}
            </HomeTabButton>
          </div>

          {selectedTab === "workplaces" ? (
            <div className="grid border-t">
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
            <div className="grid border-t">
              {revisionHistory.map((history) => (
                <HistoryItem
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
      className="h-[32px] cursor-pointer border-0 bg-transparent px-[8px] text-base font-medium text-foreground/70 hover:text-foreground"
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

function WorkplaceItem({
  onNavigate,
  workplace,
}: {
  onNavigate: (page: PageKey) => void;
  workplace: (typeof workplaces)[number];
}) {
  const { t } = useTranslation();
  return (
    <Card className="border-b ring-0">
      <CardContent className="grid gap-[8px] p-[12px]">
        <div className="flex min-w-0 items-center justify-between gap-[8px]">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{workplace.title}</div>
            {workplace.description && 
              <p className="m-0 truncatesm text-muted-foreground">
                {workplace.description}
              </p>
            }
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {workplace.updatedAt}
          </span>
        </div>
        <div className="flex flex-wrap gap-[6px]">
          <button
            className="cursor-pointer rounded-md border bg-transparent px-[8px] py-[4px] text-xs hover:bg-accent hover:text-accent-foreground"
            onClick={() => onNavigate("projects")}
            type="button"
          >
            {t("top.tasks")} {workplace.taskCount}
          </button>
          <button
            className="cursor-pointer rounded-md border bg-transparent px-[8px] py-[4px] text-xs hover:bg-accent hover:text-accent-foreground"
            onClick={() => onNavigate("projectDocumentList")}
            type="button"
          >
            {t("top.documents")} {workplace.documentCount}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryItem({
  kind,
  time,
  title,
}: {
  kind: "課題" | "文書";
  time: string;
  title: string;
}) {
  const { t } = useTranslation();
  const PageIcon = kind === "課題" ? ListTodo : FileText;
  const translatedTime = time === "Today"
    ? t("top.today")
    : time === "Yesterday"
      ? t("top.yesterday")
      : /^\d+ days? ago$/.test(time)
        ? t("top.daysAgo", { count: Number.parseInt(time, 10) })
        : time;

  return (
    <Card className="border-b ring-0">
      <CardContent className="grid gap-[2px] p-[12px]">
        <div className="flex min-w-0 items-center justify-between gap-[8px] py-[16px]">
          <span className="flex min-w-0 items-center gap-[6px]">
            <PageLink icon={PageIcon} pageName={title} />
            <Badge className="h-[18px] shrink-0 px-[8px] text-[10px] border-2 rounded-full pb-[2px]" variant="outline">
              {kind}
            </Badge>
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
          {translatedTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function flattenTasks(tasks: ProjectTask[]): ProjectTask[] {
  return tasks.flatMap((task) => [task, ...flattenTasks(task.children ?? [])]);
}
