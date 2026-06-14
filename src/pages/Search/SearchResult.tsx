import { useMemo, useState } from "react";
import { FileText, ListTodo, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/pages/PageShell";

type SearchResultType = "issue" | "wiki";
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
    id: "issue-1",
    type: "issue",
    title: "通知設定画面の保存処理を見直す",
    path: "Project A/Issue B/Issue C",
    description:
      "通知設定の変更後に保存状態が分かりづらいため、完了メッセージと入力内容の保持ルールを整理します。",
  },
  {
    id: "wiki-1",
    type: "wiki",
    title: "検索仕様メモ",
    path: "Workspace A/Wiki B/Wiki C",
    description:
      "検索対象、キーワードの扱い、結果表示に必要な項目をまとめた設計用のWikiページです。",
  },
  {
    id: "issue-2",
    type: "issue",
    title: "Issue詳細の説明欄を読みやすくする",
    path: "Project Alpha/改善タスク/説明欄UI",
    description:
      "長文の説明を入力したときでも視線が迷わないよう、余白、行間、補助情報の配置を調整します。",
  },
  {
    id: "wiki-2",
    type: "wiki",
    title: "プロジェクト運用ルール",
    path: "開発Workspace/運用Wiki/プロジェクト運用ルール",
    description:
      "Issueの親子関係、Wikiとの使い分け、レビュー前に確認する項目をチーム向けに整理しています。",
  },
];

const resultTypeConfig: Record<
  SearchResultType,
  {
    Icon: LucideIcon;
    label: string;
  }
> = {
  issue: {
    Icon: ListTodo,
    label: "Issue",
  },
  wiki: {
    Icon: FileText,
    label: "WIKI",
  },
};

const searchResultFilters: {
  label: string;
  type: SearchResultFilter;
}[] = [
  {
    label: "All",
    type: "all",
  },
  {
    label: "Issues",
    type: "issue",
  },
  {
    label: "WIKI",
    type: "wiki",
  },
];

type SearchResultProps = {
  query?: string;
};

export function SearchResult({ query = "" }: SearchResultProps) {
  const [activeFilter, setActiveFilter] = useState<SearchResultFilter>("all");
  const searchQuery = query.trim();
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") {
      return searchResults;
    }

    return searchResults.filter((result) => result.type === activeFilter);
  }, [activeFilter]);

  return (
    <PageShell
      badge="Search"
      title="検索結果"
      description="IssueとWikiの検索結果を一覧で確認できます。"
    >
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
                {filter.label}
              </Button>
            );
          })}
        </div>

        <div className="mb-[12px] flex shrink-0 items-center justify-start gap-[12px] border-b pb-[12px] text-xs text-muted-foreground">
          <span>
            {searchQuery
              ? `「${searchQuery}」に一致する結果`
              : "検索結果"}
          </span>
          <span>{filteredResults.length}件</span>
        </div>

        <div className="hover-scrollbar-y grid min-h-0 gap-[0px] overflow-y-auto pr-[4px]">
          {filteredResults.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

type SearchResultCardProps = {
  result: SearchResultItem;
};

function SearchResultCard({ result }: SearchResultCardProps) {
  const { Icon, label } = resultTypeConfig[result.type];

  return (
    <article className="grid grid-cols-[auto_1fr] gap-[12px] border-0 border-b bg-background px-[14px] py-[12px]">
      <div className="grid size-[36px] shrink-0 place-items-center self-center rounded-md border-0 bg-transparent text-muted-foreground">
        <Icon className="size-[36px]" aria-hidden="true" />
        {/* <span className="sr-only">{label}</span> */}
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
    </article>
  );
}
