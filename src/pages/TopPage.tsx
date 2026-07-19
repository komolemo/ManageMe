import { useState } from "react";
import { BookOpenText, FileText, Kanban, ListTodo } from "lucide-react";
import { PageLink } from "@/components/app/PageLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import type { ProjectTask } from "@/pages/projectData";
import { WORKSPACE_TYPE } from "@/features/workspace/types";
import { WorkspaceListView } from "@/pages/WorkspaceListPage/workspaceList";

type TopPageProps = {
  onNavigate: (page: PageKey) => void;
  tasks: ProjectTask[];
};

type HomeTab = "project" | "library" | "recent";

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
  const [selectedTab, setSelectedTab] = useState<HomeTab>("project");
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
          <div className="grid h-[32px] w-full grid-cols-3" role="tablist">
            <HomeTabButton
              isSelected={selectedTab === "project"}
              onClick={() => setSelectedTab("project")}
            >
              {t("top.projects")}
            </HomeTabButton>
            <HomeTabButton
              isSelected={selectedTab === "library"}
              onClick={() => setSelectedTab("library")}
            >
              {t("top.library")}
            </HomeTabButton>
            <HomeTabButton
              isSelected={selectedTab === "recent"}
              onClick={() => setSelectedTab("recent")}
            >
              {t("top.sortedByDate")}
            </HomeTabButton>
          </div>

          {selectedTab === "project" ? (
            <WorkspaceListView
              icon={Kanban}
              workspaceType={WORKSPACE_TYPE.PROJECT}
              onOpenInNewTab={() => onNavigate("project")}
              onSelect={() => onNavigate("project")}
            />
          ) : null}

          {selectedTab === "library" ? (
            <WorkspaceListView
              icon={BookOpenText}
              workspaceType={WORKSPACE_TYPE.LIBRARY}
              onOpenInNewTab={() => onNavigate("library")}
              onSelect={() => onNavigate("library")}
            />
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
