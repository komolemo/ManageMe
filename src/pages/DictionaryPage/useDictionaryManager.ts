import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { useDictionaryStore } from "@/features/dictionary/dictionaryStore";
import type { DictionaryWord } from "@/features/dictionary/types";

export type WordForm = {
  description: string;
  furigana: string;
  word: string;
};

const emptyForm = (): WordForm => ({ description: "", furigana: "", word: "" });
const hiraganaPattern = /^[\p{Script=Hiragana}ー]*$/u;

function useDictionaryManagerState() {
  const createWord = useDictionaryStore((state) => state.createWord);
  const updateWord = useDictionaryStore((state) => state.updateWord);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [editingWord, setEditingWord] = useState<DictionaryWord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFuriganaError, setShowFuriganaError] = useState(false);
  const hasInvalidFurigana = !hiraganaPattern.test(form.furigana);

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

  return {
    closeDialog,
    editingWord,
    form,
    hasInvalidFurigana,
    isFormOpen,
    isSaving,
    openCreate,
    openEdit,
    saveWord,
    setForm,
    setIsFormOpen,
    setShowFuriganaError,
    showFuriganaError,
  };
}

type DictionaryManagerContextValue = ReturnType<typeof useDictionaryManagerState>;
const DictionaryManagerContext = createContext<DictionaryManagerContextValue | null>(null);

export function DictionaryManagerProvider({ children }: { children: ReactNode }) {
  const value = useDictionaryManagerState();
  return createElement(DictionaryManagerContext.Provider, { value }, children);
}

export function useDictionaryManager() {
  const context = useContext(DictionaryManagerContext);
  if (!context) {
    throw new Error("useDictionaryManager must be used within DictionaryManagerProvider");
  }
  return context;
}
