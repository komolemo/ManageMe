import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { MenuButton } from "@/components/app/MenuButton";
import { SearchForm } from "@/components/app/SearchForm";
import { SidebarItem } from "@/components/app/SidebarItem";
import { useDictionaryStore } from "@/features/dictionary/dictionaryStore";
import type { DictionaryWord } from "@/features/dictionary/types";
import { PageShell } from "@/pages/PageShell";
import {
  AddWordButton,
  AddWordDialog,
  type WordForm,
} from "./AddWordItem";

const emptyForm = (): WordForm => ({
  description: "", furigana: "", word: "",
});

const hiraganaPattern = /^[\p{Script=Hiragana}ー]*$/u;

const dictionaryGroups = [
  "A–E", "F–J", "K–O", "P–T", "U–Z",
  "あ～お", "か～こ", "さ～そ", "た～と", "な～の",
  "は～ほ", "ま～も", "や～よ", "ら～ろ", "わ～ん",
] as const;

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

type DictionaryGroup = (typeof dictionaryGroups)[number];

function DictionaryGroupList({
  activeGroup,
  onSelect,
  query,
}: {
  activeGroup: string;
  onSelect: (group: DictionaryGroup) => void;
  query: string;
}) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("dictionary.index")} className="grid gap-1">
      {dictionaryGroups.map((group) => (
        <SidebarItem
          key={group}
          selected={!query.trim() && activeGroup === group}
        >
          <button
            className="flex min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-left text-sm text-current"
            onClick={() => onSelect(group)}
            type="button"
          >
            {group}
          </button>
        </SidebarItem>
      ))}
    </nav>
  );
}

export function DictionaryPage() {
  const { t } = useTranslation();
  const { createWord, deleteWord, error, isLoading, loadWords, searchWords, updateWord, words } = useDictionaryStore();
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("A–E");
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [editingWord, setEditingWord] = useState<DictionaryWord | null>(null);
  const [deletingWord, setDeletingWord] = useState<DictionaryWord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFuriganaError, setShowFuriganaError] = useState(false);
  const hasInvalidFurigana = !hiraganaPattern.test(form.furigana);
  const visibleWords = useMemo(
    () => query.trim()
      ? words
      : words.filter((item) => belongsToGroup(item.normalizedWord, activeGroup)),
    [activeGroup, query, words],
  );

  useEffect(() => { void loadWords(); }, [loadWords]);

  const openCreate = () => {
    setEditingWord(null);
    setForm(emptyForm());
    setShowFuriganaError(false);
    setIsFormOpen(true);
  };

  const openEdit = (item: DictionaryWord) => {
    setEditingWord(item);
    setForm({
      description: item.description,
      furigana: hiraganaPattern.test(item.normalizedWord)
        ? item.normalizedWord
        : "",
      word: item.word,
    });
    setShowFuriganaError(false);
    setIsFormOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const word = form.word.trim();
    if (hasInvalidFurigana) {
      setShowFuriganaError(true);
      return;
    }
    if (!word) return;
    setIsSaving(true);
    try {
      const input = {
        word,
        normalizedWord: form.furigana || undefined,
        description: form.description.trim(),
        createdBy: "user" as const,
        confidence: editingWord?.confidence ?? null,
      };
      if (editingWord) {
        await updateWord(editingWord.dictionaryWordId, input);
      } else {
        await createWord({ dictionaryWordId: crypto.randomUUID(), ...input });
      }
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

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
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <BookOpen className="size-4" />Dictionary
            </span>
            <h1 className="m-0 text-2xl font-semibold tracking-tight">{t("dictionary.title")}</h1>
            <p className="mb-0 mt-2 text-sm text-muted-foreground">{t("dictionary.help")}</p>
          </div>
          <div className="flex items-center gap-3">
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
            <AddWordButton onClick={openCreate} />
          </div>
        </header>
        <section aria-busy={isLoading} aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="m-0 text-lg font-semibold">{query ? t("dictionary.searchResults") : activeGroup}</h2>
            <span className="text-xs text-muted-foreground">{t("dictionary.count", { count: visibleWords.length })}</span>
          </div>
          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {!isLoading && visibleWords.length === 0 ? (
            <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">{t("dictionary.noneFound")}</div>
          ) : (
            <dl className="m-0 overflow-hidden rounded-lg border">
              {visibleWords.map((item) => (
                <div className="grid grid-cols-[minmax(0,210px)_minmax(0,1fr)_24px] items-start gap-6 border-b px-5 py-4 last:border-b-0" key={item.dictionaryWordId}>
                  <dt className="text-base font-semibold">{item.word}</dt>
                  <dd className="m-0">
                    <p className="m-0 text-sm leading-7 text-foreground/85">{item.description || "—"}</p>
                  </dd>
                  <dd className="m-0">
                    <MenuButton
                      actions={[
                        { label: t("common.rename"), onSelect: () => openEdit(item) },
                        { label: t("common.delete"), onSelect: () => setDeletingWord(item) },
                      ]}
                      ariaLabel={t("dictionary.openMenu", { word: item.word })}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <AddWordDialog
        form={form}
        hasInvalidFurigana={hasInvalidFurigana}
        isEditing={Boolean(editingWord)}
        isOpen={isFormOpen}
        isSaving={isSaving}
        onOpenChange={setIsFormOpen}
        onSubmit={submit}
        setForm={setForm}
        setShowFuriganaError={setShowFuriganaError}
        showFuriganaError={showFuriganaError}
      />
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
