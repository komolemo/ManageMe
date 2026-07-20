export type DictionaryWordCreator = "ai" | "user";

export type DictionaryWord = {
  dictionaryWordId: string;
  word: string;
  normalizedWord: string;
  description: string;
  createdBy: DictionaryWordCreator;
  confidence: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDictionaryWordInput = Pick<
  DictionaryWord,
  | "dictionaryWordId"
  | "word"
  | "description"
  | "createdBy"
  | "confidence"
> & {
  normalizedWord?: string;
};

export type UpdateDictionaryWordInput = Omit<
  CreateDictionaryWordInput,
  "dictionaryWordId"
>;
