import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { SearchForm } from "@/components/app/SearchForm";
import { useDictionaryStore } from "@/features/dictionary/dictionaryStore";
import type { DictionaryWord } from "@/features/dictionary/types";
import { PageShell } from "@/pages/PageShell";
import {
  AddWordButton,
  AddWordDialog,
} from "./AddWordItem";
import {
  DictionaryManagerProvider,
} from "./useDictionaryManager";
import { DictionaryGroupList } from "./DictionaryGroup";
import { WordList } from "./WordList";

const kanaGroups: Record<string, string> = {
  "あ～お": "あいうえおぁぃぅぇぉ",
  "か～こ": "かきくけこがぎぐげご",
  "さ～そ": "さしすせそざじずぜぞ",
  "た～と": "たちつてとだぢづでどっ",
  "な～の": "なにぬねの",
  "は～ほ": "はひふへほばびぶべぼぱぴぷぺぽ",
  "ま～も": "まみむめも",
  "や～よ": "やゆよゃゅょ",
  "ら～ろ": "らりるれろ",
  "わ～ん": "わをんゎ",
};

function belongsToGroup(normalizedWord: string, group: string) {
  const firstCharacter = normalizedWord.trim().charAt(0);
  if (!firstCharacter) return false;
  const latinRanges: Record<string, [string, string]> = {
    "A–E": ["A", "E"],
    "F–J": ["F", "J"],
    "K–O": ["K", "O"],
    "P–T": ["P", "T"],
    "U–Z": ["U", "Z"],
  };
  const range = latinRanges[group];
  if (range) {
    const character = firstCharacter.toLocaleUpperCase();
    return character >= range[0] && character <= range[1];
  }
  return kanaGroups[group]?.includes(firstCharacter) ?? false;
}

function DictionaryPageContent() {
  const { t } = useTranslation();
  const { deleteWord, error, isLoading, loadWords, searchWords, words } = useDictionaryStore();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("A–E");
  const [deletingWord, setDeletingWord] = useState<DictionaryWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const visibleWords = useMemo(
    () => query.trim()
      ? words
      : words.filter((item) => belongsToGroup(item.normalizedWord, activeGroup)),
    [activeGroup, query, words],
  );

  useEffect(() => { void loadWords(); }, [loadWords]);

  const confirmDelete = async () => {
    if (!deletingWord) return;
    setIsDeleting(true);
    try {
      await deleteWord(deletingWord.dictionaryWordId);
      setDeletingWord(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      breadcrumbs={[{ label: t("pages.common") }, { label: t("pages.dictionary") }]}
      detailSidebar={
        <DictionaryGroupList
          activeGroup={activeGroup}
          onSelect={(group) => {
            setActiveGroup(group);
            setQuery("");
            void loadWords();
          }}
          query={query}
        />
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
            <SearchForm
              className="h-9 w-[280px]"
              inputId="dictionary-search"
              onChange={(value) => {
                setQuery(value);
                if (!value.trim()) void loadWords();
              }}
              onSearch={(value) => void searchWords(value)}
              placeholder={t("dictionary.search")}
              value={query}
            />
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
          <WordList
            isLoading={isLoading}
            onDelete={setDeletingWord}
            words={visibleWords}
          />
        </section>
      </div>

      {/* 単語追加モーダル */}
      <AddWordDialog />

      {/* 単語削除確認モーダル */}
      <DeleteConfirmationDialog
        description={t("dictionary.deleteDescription", { word: deletingWord?.word ?? "" })}
        isDeleting={isDeleting}
        onConfirm={() => void confirmDelete()}
        onOpenChange={(open) => { if (!open) setDeletingWord(null); }}
        open={Boolean(deletingWord)}
        title={t("dictionary.deleteTitle")}
      />
    </PageShell>
  );
}

export function DictionaryPage() {
  return (
    <DictionaryManagerProvider>
      <DictionaryPageContent />
    </DictionaryManagerProvider>
  );
}
