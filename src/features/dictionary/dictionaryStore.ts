import { create } from "zustand";
import { dictionaryApi } from "@/features/dictionary/dictionaryApi";
import type {
  CreateDictionaryWordInput,
  DictionaryWord,
  UpdateDictionaryWordInput,
} from "@/features/dictionary/types";

type DictionaryStore = {
  error: string | null;
  isLoading: boolean;
  words: DictionaryWord[];
  createWord: (input: CreateDictionaryWordInput) => Promise<DictionaryWord>;
  deleteWord: (dictionaryWordId: string) => Promise<boolean>;
  getWordById: (dictionaryWordId: string) => Promise<DictionaryWord | null>;
  loadWords: (initial?: string) => Promise<void>;
  searchWords: (query: string) => Promise<void>;
  updateWord: (
    dictionaryWordId: string,
    input: UpdateDictionaryWordInput,
  ) => Promise<DictionaryWord | null>;
};

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const useDictionaryStore = create<DictionaryStore>((set) => ({
  error: null,
  isLoading: false,
  words: [],

  loadWords: async (initial) => {
    set({ error: null, isLoading: true });
    try {
      set({ words: await dictionaryApi.list(initial) });
    } catch (error) {
      set({ error: message(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  searchWords: async (query) => {
    set({ error: null, isLoading: true });
    try {
      set({ words: await dictionaryApi.search(query) });
    } catch (error) {
      set({ error: message(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getWordById: async (dictionaryWordId) => {
    set({ error: null });
    try {
      return await dictionaryApi.getById(dictionaryWordId);
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },

  createWord: async (input) => {
    set({ error: null });
    try {
      const word = await dictionaryApi.create(input);
      set((state) => ({
        words: [
          word,
          ...state.words.filter(
            (item) => item.dictionaryWordId !== word.dictionaryWordId,
          ),
        ].sort((a, b) => a.normalizedWord.localeCompare(b.normalizedWord)),
      }));
      return word;
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },

  updateWord: async (dictionaryWordId, input) => {
    set({ error: null });
    try {
      const word = await dictionaryApi.update(dictionaryWordId, input);
      if (word) {
        set((state) => ({
          words: state.words
            .map((item) =>
              item.dictionaryWordId === dictionaryWordId ? word : item
            )
            .sort((a, b) =>
              a.normalizedWord.localeCompare(b.normalizedWord)
            ),
        }));
      }
      return word;
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },

  deleteWord: async (dictionaryWordId) => {
    set({ error: null });
    try {
      const deleted = await dictionaryApi.delete(dictionaryWordId);
      if (deleted) {
        set((state) => ({
          words: state.words.filter(
            (item) => item.dictionaryWordId !== dictionaryWordId,
          ),
        }));
      }
      return deleted;
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },
}));
