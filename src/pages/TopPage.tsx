import { useEffect, useState } from "react";
import { BookOpenText, FileText, Kanban, ListTodo } from "lucide-react";
import { PageLink } from "@/components/app/PageLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import { WORKSPACE_TYPE, type Workspace } from "@/features/workspace/types";
import { WorkspaceListView } from "@/pages/WorkspaceListPage/workspaceList";
import { revisionApi } from "@/features/revision/revisionApi";
import type { Revision } from "@/features/revision/types";

type TopPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenDocument: (documentId: string) => void;
  onOpenProject: (workspace: Workspace) => void;
  onOpenProjectInNewTab: (workspace: Workspace) => void;
  onOpenTask: (taskId: string) => void;
};

type HomeTab = "project" | "library" | "recent";

export function TopPage({
  onNavigate,
  onOpenDocument,
  onOpenProject,
  onOpenProjectInNewTab,
  onOpenTask,
}: TopPageProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<HomeTab>("project");
  const [revisionHistory, setRevisionHistory] = useState<Revision[]>([]);

  useEffect(() => {
    if (selectedTab !== "recent") return;
    let cancelled = false;
    void revisionApi.listRecent(10).then((revisions) => {
      if (!cancelled) setRevisionHistory(revisions);
    }).catch(() => {
      if (!cancelled) setRevisionHistory([]);
    });
    return () => { cancelled = true; };
  }, [selectedTab]);

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
              onOpenInNewTab={onOpenProjectInNewTab}
              onSelect={onOpenProject}
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
                  key={`${history.kind}-${history.id}`}
                  kind={history.kind}
                  onOpen={() => {
                    if (history.kind === "task") {
                      onOpenTask(history.id);
                    } else {
                      onOpenDocument(history.id);
                    }
                  }}
                  time={history.updatedAt}
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
  onOpen,
  time,
  title,
}: {
  kind: Revision["kind"];
  onOpen: () => void;
  time: string;
  title: string;
}) {
  const { i18n, t } = useTranslation();
  const PageIcon = kind === "task" ? ListTodo : FileText;
  const label = kind === "task" ? t("search.issue") : t("search.document");
  const translatedTime = formatRevisionTime(time, i18n.language, t);

  return (
    <button
      className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-foreground"
      onClick={onOpen}
      type="button"
    >
      <Card className="border-b ring-0 transition-colors hover:bg-muted/50">
        <CardContent className="grid gap-[2px] p-[12px]">
          <div className="flex min-w-0 items-center justify-between gap-[8px] py-[16px]">
            <span className="flex min-w-0 items-center gap-[6px]">
              <PageLink icon={PageIcon} pageName={title} />
              <Badge className="h-[18px] shrink-0 px-[8px] text-[10px] border-2 rounded-full pb-[2px]" variant="outline">
                {label}
              </Badge>
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {translatedTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function formatRevisionTime(
  value: string,
  language: string,
  translate: (key: string, options?: { count: number }) => string,
) {
  const normalizedValue = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const updatedAt = new Date(normalizedValue);
  if (Number.isNaN(updatedAt.getTime())) return value;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const updatedStart = new Date(
    updatedAt.getFullYear(),
    updatedAt.getMonth(),
    updatedAt.getDate(),
  );
  const daysAgo = Math.floor(
    (todayStart.getTime() - updatedStart.getTime()) / 86_400_000,
  );
  if (daysAgo === 0) return translate("top.today");
  if (daysAgo === 1) return translate("top.yesterday");
  if (daysAgo > 1) return translate("top.daysAgo", { count: daysAgo });
  return updatedAt.toLocaleDateString(language);
}
