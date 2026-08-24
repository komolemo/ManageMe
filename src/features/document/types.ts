export type DocumentType = "document" | "task";

export type DocumentRecord = {
  documentId: string;
  workspaceId: string;
  documentType: DocumentType;
  title: string;
  content: string;
  iconId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateDocumentInput = {
  documentId: string;
  workspaceId: string;
  title: string;
  content: string;
  iconId: string | null;
};

export type DocumentPatch = {
  title?: string;
  content?: string;
  iconId?: string;
};

export type UpdateDocumentInput = DocumentPatch & {
  expectedUpdatedAt?: string;
};

export type DocumentTreeNode = {
  document: DocumentRecord;
  children: DocumentTreeNode[];
};
