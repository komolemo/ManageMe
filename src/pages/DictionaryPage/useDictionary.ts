import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDictionaryStore } from "@/features/dictionary/dictionaryStore";
import type { DictionaryWord } from "@/features/dictionary/types";
import type { DictionaryGroup } from "./DictionaryGroup";

export type WordForm = {
  description: string;
  furigana: string;
  word: string;
};

const emptyForm = (): WordForm => ({ description: "", furigana: "", word: "" });
const hiraganaPattern = /^[\p{Script=Hiragana}ー]*$/u;

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

function useDictionaryState() {
  const createWord = useDictionaryStore((state) => state.createWord);
  const deleteWord = useDictionaryStore((state) => state.deleteWord);
  const error = useDictionaryStore((state) => state.error);
  const isLoading = useDictionaryStore((state) => state.isLoading);
  const loadWords = useDictionaryStore((state) => state.loadWords);
  const searchWords = useDictionaryStore((state) => state.searchWords);
  const updateWord = useDictionaryStore((state) => state.updateWord);
  const words = useDictionaryStore((state) => state.words);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<DictionaryGroup>("A–E");
  const [deletingWord, setDeletingWord] = useState<DictionaryWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [editingWord, setEditingWord] = useState<DictionaryWord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFuriganaError, setShowFuriganaError] = useState(false);
  const hasInvalidFurigana = !hiraganaPattern.test(form.furigana);
  const visibleWords = useMemo(
    () => query.trim()
      ? words
      : words.filter((item) => belongsToGroup(item.normalizedWord, activeGroup)),
    [activeGroup, query, words],
  );

  useEffect(() => { void loadWords(); }, [loadWords]);

  const changeQuery = (value: string) => {
    setQuery(value);
    if (!value.trim()) void loadWords();
  };

  const search = (value: string) => void searchWords(value);

  const selectGroup = (group: DictionaryGroup) => {
    setActiveGroup(group);
    setQuery("");
    void loadWords();
  };

  const closeDeleteDialog = () => setDeletingWord(null);

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
      furigana: hiraganaPattern.test(item.normalizedWord) ? item.normalizedWord : "",
      word: item.word,
    });
    setShowFuriganaError(false);
    setIsFormOpen(true);
  };

  const closeDialog = () => setIsFormOpen(false);

  const saveWord = async () => {
    const word = form.word.trim();
    if (hasInvalidFurigana) {
      setShowFuriganaError(true);
      return;
    }
    if (!word || isSaving) return;

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
      closeDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingWord || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteWord(deletingWord.dictionaryWordId);
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    activeGroup,
    changeQuery,
    closeDialog,
    closeDeleteDialog,
    confirmDelete,
    deletingWord,
    editingWord,
    error,
    form,
    hasInvalidFurigana,
    isDeleting,
    isFormOpen,
    isLoading,
    isSaving,
    openCreate,
    openEdit,
    query,
    search,
    saveWord,
    selectGroup,
    setDeletingWord,
    setForm,
    setIsFormOpen,
    setShowFuriganaError,
    showFuriganaError,
    visibleWords,
  };
}

type DictionaryContextValue = ReturnType<typeof useDictionaryState>;
const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const value = useDictionaryState();
  return createElement(DictionaryContext.Provider, { value }, children);
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) throw new Error("useDictionary must be used within DictionaryProvider");
  return context;
}
