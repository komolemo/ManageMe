import {
  BookA,
  KanbanSquare,
  Library,
  Search
} from "lucide-react";
import type { MouseEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/useSettings";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import {
  AppSidebarDictionary,
  AppSidebarSearch,
  AppSidebarSimpleItem,
} from "./AppSidebarItem";
import { AppSidebarToggle } from "./AppSidebarToggle";
import {
  LibrarySidebarGroup,
  ProjectSidebarGroup,
} from "./SidebarGroup";

type AppSidebarProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onOpenDocument: (documentTitle: string) => void;
  onOpenDocumentInNewTab: (documentTitle: string) => void;
};

export function AppSidebar({
  onNavigate,
  onOpenInNewTab,
  onOpenDocument,
  onOpenDocumentInNewTab,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const isSidebarOpen = useSettings((state) => state.isAppSidebarOpen);
  const openPageWithMouseWheel = (
    event: MouseEvent<HTMLElement>,
    page: PageKey
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab(page);
  };

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-0 bg-header text-sidebar-foreground gap-2 ${
        isSidebarOpen ? "w-[180px]" : "w-[56px]"
      }`}
      aria-label={t("a11y.primarySidebar")}
    >
      <div
        className={`flex w-full shrink-0 ${
          isSidebarOpen ? "justify-end" : "justify-center"
        }`}
      >
        <AppSidebarToggle />
      </div>

      {isSidebarOpen ? (
        // ================================================================
        // サイドバー「開」状態の項目群
        <div className="hover-scrollbar-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-[12px]">
          {/* 検索ボタン */}
          <AppSidebarSearch
            onClick={() => onNavigate("search")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
          />

          {/* 水平線 */}
          <Separator />

          {/* プロジェクト一覧 */}
          <ProjectSidebarGroup
            onMenuNavigate={() => onNavigate("projects")}
            onMenuOpenInNewTab={() => onOpenInNewTab("projects")}
            onItemClick={() => onNavigate("project")}
            onItemOpenInNewTab={() => onOpenInNewTab("project")}
          />

          {/* 水平線 */}
          <Separator />

          {/* ライブラリ一覧 */}
          <LibrarySidebarGroup
            onMenuNavigate={() => onNavigate("library")}
            onMenuOpenInNewTab={() => onOpenInNewTab("library")}
            onItemClick={onOpenDocument}
            onItemOpenInNewTab={onOpenDocumentInNewTab}
          />

          {/* 水平線 */}
          <Separator />

          {/* 辞書ボタン */}
          <AppSidebarDictionary
            onClick={() => onNavigate("dictionary")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "dictionary")
            }
          />
        </div>
      ) : (
        // ================================================================
        // サイドバー「閉」状態の項目群
        <div className="hover-scrollbar-y grid min-h-0 flex-1 content-start justify-center gap-2 overflow-x-hidden overflow-y-auto px-[2px] pt-[10px]">
          {/* 検索ボタン・簡易 */}
          <AppSidebarSimpleItem
            icon={<Search className="size-6" />}
            label={t("sidebar.search")}
            onClick={() => onNavigate("search")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "search")}
          />
          {/* プロジェクト一覧ボタン・簡易 */}
          <AppSidebarSimpleItem
            icon={<KanbanSquare className="size-6 text-current" />}
            label={t("sidebar.projects")}
            onClick={() => onNavigate("projects")}
            onAuxClick={(event) => openPageWithMouseWheel(event, "projects")}
          />
          {/* ライブラリ一覧ボタン・簡易 */}
          <AppSidebarSimpleItem
            icon={<Library className="size-6 text-current" />}
            label={t("sidebar.document")}
            onClick={() => onNavigate("library")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "library")
            }
          />
          {/* 辞書ボタン・簡易 */}
          <AppSidebarSimpleItem
            icon={<BookA className="size-6 text-current" />}
            label={t("sidebar.dictionary")}
            onClick={() => onNavigate("dictionary")}
            onAuxClick={(event) =>
              openPageWithMouseWheel(event, "dictionary")
            }
          />
        </div>
      )}
    </aside>
  );
}
