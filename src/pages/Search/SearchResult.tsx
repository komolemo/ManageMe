import { useMemo, useState } from "react";
import { FileText, ListTodo, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/pages/PageShell";
import { useTranslation } from "react-i18next";

type SearchResultType = "task" | "document";
type SearchResultFilter = "all" | SearchResultType;

type SearchResultItem = {
  id: string;
  type: SearchResultType;
  title: string;
  path: string;
  description: string;
};

const searchResults: SearchResultItem[] = [
  {
    id: "101",
    type: "task",
    title: "通知設定画面の保存処理を見直す",
    path: "Project A/Issue B/Issue C",
    description:
      "通知設定の変更後に保存状態が分かりづらいため、完了メッセージと入力内容の保持ルールを整理します。",
  },
  {
    id: "test-document-database-design",
    type: "document",
    title: "検索仕様メモ",
    path: "Workspace A/Document B/Document C",
    description:
      "検索対象、キーワードの扱い、結果表示に必要な項目をまとめた設計用のDocumentページです。",
  },
  {
    id: "102",
    type: "task",
    title: "Issue詳細の説明欄を読みやすくする",
    path: "Project Alpha/改善タスク/説明欄UI",
    description:
      "長文の説明を入力したときでも視線が迷わないよう、余白、行間、補助情報の配置を調整します。",
  },
  {
    id: "test-document-api-design",
    type: "document",
    title: "プロジェクト運用ルール",
    path: "開発Workspace/運用Document/プロジェクト運用ルール",
    description:
      "Issueの親子関係、Documentとの使い分け、レビュー前に確認する項目をチーム向けに整理しています。",
  },
];

const resultTypeConfig: Record<
  SearchResultType,
  {
    Icon: LucideIcon;
    labelKey: string;
  }
> = {
  task: {
    Icon: ListTodo,
    labelKey: "search.issue",
  },
  document: {
    Icon: FileText,
    labelKey: "search.document",
  },
};

const searchResultFilters: {
  labelKey: string;
  type: SearchResultFilter;
}[] = [
  {
    labelKey: "search.all",
    type: "all",
  },
  {
    labelKey: "search.issues",
    type: "task",
  },
  {
    labelKey: "search.document",
    type: "document",
  },
];

type SearchResultProps = {
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  query?: string;
};

export function SearchResult({
  onOpenDocument,
  onOpenTask,
  query = "",
}: SearchResultProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<SearchResultFilter>("all");
  const searchQuery = query.trim();
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") {
      return searchResults;
    }

    return searchResults.filter((result) => result.type === activeFilter);
  }, [activeFilter]);

  return (
    <PageShell breadcrumbs={[{ label: t("pages.search") }, { label: t("pages.results") }]}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="mb-[12px] flex shrink-0 flex-wrap items-center gap-[8px]">
          {searchResultFilters.map((filter) => {
            const isActive = filter.type === activeFilter;

            return (
              <Button
                aria-pressed={isActive}
                className="rounded-full px-[14px] py-[4px]"
                key={filter.type}
                onClick={() => setActiveFilter(filter.type)}
                size="sm"
                type="button"
                variant={isActive ? "default" : "outline"}
              >
                {t(filter.labelKey)}
              </Button>
            );
          })}
        </div>

        <div className="mb-[12px] flex shrink-0 items-center justify-start gap-[12px] border-b pb-[12px] text-xs text-muted-foreground">
          <span>
            {searchQuery
              ? t("search.matchedResults", { query: searchQuery })
              : t("search.resultTitle")}
          </span>
          <span>{t("search.resultCount", { count: filteredResults.length })}</span>
        </div>

        <div className="hover-scrollbar-y grid min-h-0 gap-[0px] overflow-y-auto pr-[4px]">
          {filteredResults.map((result) => (
            <SearchResultCard
              key={result.id}
              onOpenDocument={onOpenDocument}
              onOpenTask={onOpenTask}
              result={result}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

type SearchResultCardProps = {
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  result: SearchResultItem;
};

function SearchResultCard({
  onOpenDocument,
  onOpenTask,
  result,
}: SearchResultCardProps) {
  const { t } = useTranslation();
  const { Icon, labelKey } = resultTypeConfig[result.type];
  const label = t(labelKey);

  return (
    <button
      className="grid grid-cols-[auto_1fr] gap-[12px] border-0 border-b bg-background px-[14px] py-[12px] text-left hover:bg-muted"
      onClick={() => {
        if (result.type === "document") {
          onOpenDocument(result.id);
        } else {
          onOpenTask(result.id);
        }
      }}
      type="button"
    >
      <div className="grid size-[36px] shrink-0 place-items-center self-center rounded-md border-0 bg-transparent text-muted-foreground">
        <Icon className="size-[36px]" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </div>

      <div className="grid min-w-0 gap-[6px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          {/* <span className="shrink-0 rounded-sm border px-[6px] py-[2px] text-[10px] font-semibold uppercase leading-none text-muted-foreground">
            {label}
          </span> */}
          <h3 className="my-[4px] min-w-0 truncate text-sm font-semibold text-foreground">
            {result.title}
          </h3>
        </div>

        <p className="my-[2px] truncate text-[12px] text-muted-foreground">
          {result.path}
        </p>
        <p className="my-[2px] line-clamp-2 text-[14px] leading-relaxed text-foreground/80">
          {result.description}
        </p>
      </div>
    </button>
  );
}
