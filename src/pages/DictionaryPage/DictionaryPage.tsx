import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/pages/PageShell";
import {
  AddWordButton,
  AddWordDialog,
} from "./AddWordItem";
import { DictionaryGroupList } from "./DictionaryGroup";
import { DictionarySearchForm } from "./DictionarySearchForm";
import { DeleteWordDialog } from "./DeleteWordDialog";
import { DictionaryProvider, useDictionary } from "./useDictionary";
import { WordList } from "./WordList";

function DictionaryPageContent() {
  const { t } = useTranslation();
  const { activeGroup, error, isLoading, query, visibleWords } = useDictionary();

  return (
    <PageShell
      breadcrumbs={[{ label: t("pages.common") }, { label: t("pages.dictionary") }]}
      detailSidebar={
        <DictionaryGroupList />
      }
    >
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 pb-8">
        {/* ヘッダー部分 */}
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          {/* ページ名 + 説明 */}
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <BookOpen className="size-4" />Dictionary
            </span>
            <h1 className="m-0 text-2xl font-semibold tracking-tight">{t("dictionary.title")}</h1>
            <p className="mb-0 mt-2 text-sm text-muted-foreground">{t("dictionary.help")}</p>
          </div>

          {/* 操作バー */}
          <div className="flex items-center gap-3">
            {/* 辞書検索フォーム */}
            <DictionarySearchForm />
            {/* 単語追加ボタン */}
            <AddWordButton />
          </div>
        </header>
        {/* メイン領域 */}
        <section aria-busy={isLoading} aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="m-0 text-lg font-semibold">{query ? t("dictionary.searchResults") : activeGroup}</h2>
            <span className="text-xs text-muted-foreground">{t("dictionary.count", { count: visibleWords.length })}</span>
          </div>
          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          
          {/* 単語リスト */}
          <WordList />
        </section>
      </div>

      {/* 単語追加モーダル */}
      <AddWordDialog />

      {/* 単語削除確認モーダル */}
      <DeleteWordDialog />
    </PageShell>
  );
}

export function DictionaryPage() {
  return (
    <DictionaryProvider>
      <DictionaryPageContent />
    </DictionaryProvider>
  );
}
