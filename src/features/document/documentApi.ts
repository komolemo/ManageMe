import { invoke } from "@tauri-apps/api/core";
import type {
  CreateDocumentInput,
  CreateTaskDocumentInput,
  DocumentRecord,
  DocumentTreeNode,
  DocumentType,
  TaskDocumentRecord,
  UpdateDocumentInput,
} from "@/features/document/types";

export const documentApi = {
  create(input: CreateDocumentInput) {
    return invoke<DocumentRecord>("create_document", { input });
  },

  getById(documentId: string, includeDeleted = false) {
    return invoke<DocumentRecord | null>("get_document_by_id", {
      documentId,
      includeDeleted,
    });
  },

  list(
    workspaceId: string,
    documentType?: DocumentType,
    includeDeleted = false,
  ) {
    return invoke<DocumentRecord[]>("list_documents", {
      workspaceId,
      documentType,
      includeDeleted,
    });
  },

  updateTitle(
    documentId: string,
    title: string,
    expectedUpdatedAt?: string,
  ) {
    return invoke<DocumentRecord | null>("update_document_title", {
      documentId,
      title,
      expectedUpdatedAt,
    });
  },

  updateContent(
    documentId: string,
    content: string,
    expectedUpdatedAt?: string,
  ) {
    return invoke<DocumentRecord | null>("update_document_content", {
      documentId,
      content,
      expectedUpdatedAt,
    });
  },

  update(documentId: string, input: UpdateDocumentInput) {
    return invoke<DocumentRecord | null>("update_document", {
      documentId,
      input,
    });
  },

  updateIcon(
    documentId: string,
    iconId: string | null,
    expectedUpdatedAt?: string,
  ) {
    return invoke<DocumentRecord | null>("update_document_icon", {
      documentId,
      iconId,
      expectedUpdatedAt,
    });
  },

  delete(documentId: string) {
    return invoke<boolean>("delete_document", { documentId });
  },

  restore(documentId: string) {
    return invoke<DocumentRecord | null>("restore_document", { documentId });
  },

  createTask(input: CreateTaskDocumentInput) {
    return invoke<TaskDocumentRecord>("create_task_document", { input });
  },

  listTree(workspaceId: string) {
    return invoke<DocumentTreeNode[]>("list_document_tree", { workspaceId });
  },

  move(
    childDocumentId: string,
    parentDocumentId?: string,
    displayOrder?: number,
  ) {
    return invoke<boolean>("move_document", {
      childDocumentId,
      parentDocumentId,
      displayOrder,
    });
  },
};
