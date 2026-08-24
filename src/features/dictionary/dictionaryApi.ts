import { invoke } from "@tauri-apps/api/core";
import type {
  CreateDictionaryWordInput,
  DictionaryWord,
  UpdateDictionaryWordInput,
} from "@/features/dictionary/types";

export const dictionaryApi = {
  create(input: CreateDictionaryWordInput) {
    return invoke<DictionaryWord>("create_dictionary_word", { input });
  },
  getById(dictionaryWordId: string) {
    return invoke<DictionaryWord | null>("get_dictionary_word_by_id", {
      dictionaryWordId,
    });
  },
  list(initial?: string) {
    return invoke<DictionaryWord[]>("list_dictionary_words", {
      initial,
    });
  },
  search(query: string) {
    return invoke<DictionaryWord[]>("search_dictionary_words", { query });
  },
  update(
    dictionaryWordId: string,
    input: UpdateDictionaryWordInput,
  ) {
    return invoke<DictionaryWord | null>("update_dictionary_word", {
      dictionaryWordId,
      input,
    });
  },
  delete(dictionaryWordId: string) {
    return invoke<boolean>("delete_dictionary_word", { dictionaryWordId });
  },
};
