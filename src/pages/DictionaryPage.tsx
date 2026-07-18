import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";

type DictionaryEntry = { term: string; definition: string; group: string };

const groups = ["A–E", "F–J", "K–O", "P–T", "U–Z", "あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];

const entries: DictionaryEntry[] = [
  { term: "API", definition: "アプリケーション同士が機能やデータをやり取りするための接続仕様。", group: "A–E" },
  { term: "Backlog", definition: "未着手のタスクや要望を、優先順位とともに蓄積した一覧。", group: "A–E" },
  { term: "Dashboard", definition: "重要な情報や進捗を一つの画面にまとめて表示する場所。", group: "A–E" },
  { term: "Filter", definition: "条件に一致する項目だけを一覧に表示する機能。", group: "F–J" },
  { term: "Issue", definition: "対応や追跡が必要な課題、作業、または問い合わせ。", group: "F–J" },
  { term: "Milestone", definition: "プロジェクト内の節目となる目標や期限。", group: "K–O" },
  { term: "Project", definition: "共通の目標に向けて、タスクや文書をまとめる作業単位。", group: "P–T" },
  { term: "Tag", definition: "項目を分類し、横断的に検索しやすくするためのラベル。", group: "P–T" },
  { term: "Workspace", definition: "プロジェクトや文書を整理して共同作業を行うための領域。", group: "U–Z" },
  { term: "アーカイブ", definition: "現在は使わない項目を削除せず、通常の一覧から退避すること。", group: "あ" },
  { term: "依存関係", definition: "あるタスクの開始や完了が、別のタスクの状態に左右される関係。", group: "あ" },
  { term: "完了条件", definition: "タスクを完了と判断するために満たすべき基準。", group: "か" },
  { term: "権限", definition: "閲覧、編集、削除など、利用者に許可された操作の範囲。", group: "か" },
  { term: "進捗", definition: "作業が完了に向けてどの程度進んでいるかを示す状態。", group: "さ" },
  { term: "担当者", definition: "タスクの実行や完了に責任を持つ利用者。", group: "た" },
  { term: "優先度", definition: "複数の作業のうち、どれを先に扱うかを示す度合い。", group: "や" },
  { term: "履歴", definition: "項目に対して行われた変更や操作を時系列で記録したもの。", group: "ら" },
];

export function DictionaryPage() {
  const [activeGroup, setActiveGroup] = useState("A–E");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleEntries = useMemo(() => normalizedQuery
    ? entries.filter((entry) => `${entry.term} ${entry.definition}`.toLocaleLowerCase().includes(normalizedQuery))
    : entries.filter((entry) => entry.group === activeGroup), [activeGroup, normalizedQuery]);

  return (
    <PageShell breadcrumbs={[{ label: "共通" }, { label: "用語辞典" }]}>
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 pb-8">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><BookOpen className="size-4" />Dictionary</span>
            <h1 className="m-0 text-2xl font-semibold tracking-tight">用語辞典</h1>
            <p className="mb-0 mt-2 text-sm text-muted-foreground">ManageMeで使われる用語と、その意味を確認できます。</p>
          </div>
          <label className="relative block w-full sm:w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="用語を検索" className="h-9 pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="用語・定義を検索" type="search" value={query} />
          </label>
        </header>
        <nav aria-label="用語の索引" className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button aria-current={!query && activeGroup === group ? "page" : undefined} className={`min-w-11 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${!query && activeGroup === group ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`} key={group} onClick={() => { setActiveGroup(group); setQuery(""); }} type="button">{group}</button>
          ))}
        </nav>
        <section aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="m-0 text-lg font-semibold">{query ? `「${query}」の検索結果` : activeGroup}</h2>
            <span className="text-xs text-muted-foreground">{visibleEntries.length}件</span>
          </div>
          {visibleEntries.length ? (
            <dl className="m-0 overflow-hidden rounded-lg border">
              {visibleEntries.map((entry) => (
                <div className="grid gap-2 border-b px-5 py-4 last:border-b-0 sm:grid-cols-[210px_1fr] sm:gap-6" key={entry.term}>
                  <dt className="text-base font-semibold">{entry.term}</dt>
                  <dd className="m-0 text-sm leading-7 text-foreground/85">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          ) : <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">該当する用語はありません。</div>}
        </section>
      </div>
    </PageShell>
  );
}
