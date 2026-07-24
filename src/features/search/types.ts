export type SearchSuggestionKind = "word" | "document" | "task";

export type SearchSuggestion = {
  kind: SearchSuggestionKind;
  id: string;
  label: string;
  workspaceId: string | null;
  lastUsedAt: string;
};

export type SearchWordLog = {
  logId: string;
  searchWord: string;
  createdAt: string;
  lastSearchedAt: string;
};

export type SearchDocumentLog = {
  logId: string;
  documentId: string;
  workspaceId: string;
  title: string;
  accessedAt: string;
};

export type SearchTaskLog = {
  logId: string;
  taskId: string;
  workspaceId: string;
  title: string;
  accessedAt: string;
};
