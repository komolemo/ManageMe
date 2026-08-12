import { useEffect, useState } from "react";
import { BookOpenText, Kanban } from "lucide-react";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import { WORKSPACE_TYPE, type Workspace } from "@/features/workspace/types";
import { WorkspaceListView } from "@/pages/WorkspaceListPage/workspaceList";
import { revisionApi } from "@/features/revision/revisionApi";
import type { Revision } from "@/features/revision/types";
import { HistoryItemList } from "@/pages/TopPage/HistoryItem";
import { HomeTabButton } from "@/pages/TopPage/HomeTabButton";

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
    if (selectedTab !== "recent") return; // <- 2. 「更新順」タブ以外では何もしない
    let cancelled = false;
    void revisionApi.listRecent(10) // <- 3. 最新10件の履歴を非同期で取得する
      .then((revisions) => {
        if (!cancelled) setRevisionHistory(revisions); // <- 4. 取得に成功したらstateを更新する
                                                       //       state更新により再レンダリングされ、HistoryItemListへ取得結果が渡されます。
      })
      .catch(() => {
        if (!cancelled) setRevisionHistory([]); // <- 5. 取得に失敗したら空の一覧にする
      });
    return () => { cancelled = true; }; // <- 6. 古くなった非同期処理によるstate更新を防ぐ
                                        //       リクエスト中に別のタブへ移動したり、コンポーネントがアンマウントされたりすると、クリーンアップ関数が cancelled = true にします。
                                        //       その後リクエストが完了しても、stateは更新されません。
  }, [selectedTab]); // <- 1. selectedTabが変わるたびに実行される
                     //       依存配列が [selectedTab] なので、タブを切り替えたときに再実行されます。

  return (
    <PageShell breadcrumbs={[{ label: t("pages.top") }]}>
      <div
        className="grid gap-[16px]"
        style={{ marginInline: "auto", width: "min(100%, 640px)" }}
      >
        <h1 className="m-0 text-[24px] font-semibold flex justify-center">{t("top.greeting")}</h1>

        <div className="grid gap-[16px]">
          {/* タブ一覧 */}
          <div className="grid h-[32px] w-full grid-cols-3" role="tablist">
            {/* 「プロジェクトタブ」ボタン */}
            <HomeTabButton
              isSelected={selectedTab === "project"}
              onClick={() => setSelectedTab("project")}
            >
              {t("top.projects")}
            </HomeTabButton>
            {/* 「ライブラリタブ」ボタン */}
            <HomeTabButton
              isSelected={selectedTab === "library"}
              onClick={() => setSelectedTab("library")}
            >
              {t("top.library")}
            </HomeTabButton>
            {/* 「更新順タブ」ボタン */}
            <HomeTabButton
              isSelected={selectedTab === "recent"}
              onClick={() => setSelectedTab("recent")}
            >
              {t("top.sortedByDate")}
            </HomeTabButton>
          </div>

          {/* 「プロジェクト」タブ */}
          {selectedTab === "project" ? (
            <WorkspaceListView
              icon={Kanban}
              workspaceType={WORKSPACE_TYPE.PROJECT}
              onOpenInNewTab={onOpenProjectInNewTab}
              onSelect={onOpenProject}
            />
          ) : null}

          {/* 「ライブラリ」タブ */}
          {selectedTab === "library" ? (
            <WorkspaceListView
              icon={BookOpenText}
              workspaceType={WORKSPACE_TYPE.LIBRARY}
              onOpenInNewTab={() => onNavigate("library")}
              onSelect={() => onNavigate("library")}
            />
          ) : null}

          {/* 「更新順」タブ */}
          {selectedTab === "recent" ? (
            <HistoryItemList
              histories={revisionHistory}
              onOpenDocument={onOpenDocument}
              onOpenTask={onOpenTask}
            />
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
