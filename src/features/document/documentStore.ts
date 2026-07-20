import { create } from "zustand";
import { documentApi } from "@/features/document/documentApi";
import type {
  CreateDocumentInput,
  CreateTaskDocumentInput,
  DocumentPatch,
  DocumentRecord,
  DocumentTreeNode,
  DocumentType,
  TaskDocumentRecord,
} from "@/features/document/types";

type SaveQueue = {
  pending: DocumentPatch | null;
  retryTimer: ReturnType<typeof setTimeout> | null;
  running: boolean;
};

type DocumentStore = {
  documents: Record<string, DocumentRecord>;
  error: string | null;
  createDocument: (input: CreateDocumentInput) => Promise<DocumentRecord>;
  createTaskDocument: (
    input: CreateTaskDocumentInput,
  ) => Promise<TaskDocumentRecord>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  getDocument: (
    documentId: string,
    includeDeleted?: boolean,
  ) => Promise<DocumentRecord | null>;
  listDocuments: (
    workspaceId: string,
    documentType?: DocumentType,
    includeDeleted?: boolean,
  ) => Promise<DocumentRecord[]>;
  listDocumentTree: (workspaceId: string) => Promise<DocumentTreeNode[]>;
  moveDocument: (
    childDocumentId: string,
    parentDocumentId?: string,
    displayOrder?: number,
  ) => Promise<boolean>;
  openOrCreateDocument: (
    input: CreateDocumentInput,
  ) => Promise<DocumentRecord>;
  queueUpdate: (documentId: string, patch: DocumentPatch) => void;
  restoreDocument: (documentId: string) => Promise<DocumentRecord | null>;
};

const queues = new Map<string, SaveQueue>();
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const queueFor = (documentId: string) => {
  const existing = queues.get(documentId);
  if (existing) return existing;
  const queue: SaveQueue = { pending: null, retryTimer: null, running: false };
  queues.set(documentId, queue);
  return queue;
};

export const useDocumentStore = create<DocumentStore>((set, get) => {
  const saveNext = async (documentId: string): Promise<void> => {
    const queue = queueFor(documentId);
    if (queue.running || !queue.pending) return;

    const patch = queue.pending;
    queue.pending = null;
    queue.running = true;
    try {
      const current = get().documents[documentId];
      const saved = await documentApi.update(documentId, {
        ...patch,
        expectedUpdatedAt: current?.updatedAt,
      });
      if (saved) {
        set((state) => ({
          documents: { ...state.documents, [documentId]: saved },
          error: null,
        }));
      }
    } catch (error) {
      queue.pending = { ...patch, ...(queue.pending ?? {}) };
      set({ error: errorMessage(error) });
      try {
        const latest = await documentApi.getById(documentId);
        if (latest) {
          set((state) => ({
            documents: {
              ...state.documents,
              [documentId]: {
                ...latest,
                ...(state.documents[documentId] ?? {}),
                updatedAt: latest.updatedAt,
              },
            },
          }));
        }
      } catch {
        // Keep the local edit queued; the retry below also covers read failures.
      }
      if (!queue.retryTimer) {
        queue.retryTimer = setTimeout(() => {
          queue.retryTimer = null;
          void saveNext(documentId);
        }, 1500);
      }
    } finally {
      queue.running = false;
      if (queue.pending && !queue.retryTimer) {
        void saveNext(documentId);
      }
    }
  };

  return {
    documents: {},
    error: null,

    getDocument: async (documentId, includeDeleted = false) => {
      const document = await documentApi.getById(documentId, includeDeleted);
      if (document) {
        set((state) => ({
          documents: { ...state.documents, [documentId]: document },
          error: null,
        }));
      }
      return document;
    },

    listDocuments: async (
      workspaceId,
      documentType,
      includeDeleted = false,
    ) => {
      const documents = await documentApi.list(
        workspaceId,
        documentType,
        includeDeleted,
      );
      set((state) => ({
        documents: {
          ...state.documents,
          ...Object.fromEntries(
            documents.map((document) => [document.documentId, document]),
          ),
        },
        error: null,
      }));
      return documents;
    },

    createDocument: async (input) => {
      const document = await documentApi.create(input);
      set((state) => ({
        documents: {
          ...state.documents,
          [document.documentId]: document,
        },
        error: null,
      }));
      return document;
    },

    createTaskDocument: async (input) => {
      const taskDocument = await documentApi.createTask(input);
      set((state) => ({
        documents: {
          ...state.documents,
          [taskDocument.document.documentId]: taskDocument.document,
        },
        error: null,
      }));
      return taskDocument;
    },

    listDocumentTree: (workspaceId) => documentApi.listTree(workspaceId),

    moveDocument: (
      childDocumentId,
      parentDocumentId,
      displayOrder,
    ) => documentApi.move(
      childDocumentId,
      parentDocumentId,
      displayOrder,
    ),

    openOrCreateDocument: async (input) => {
      const existing = await documentApi.getById(input.documentId);
      if (existing) {
        set((state) => ({
          documents: {
            ...state.documents,
            [existing.documentId]: existing,
          },
          error: null,
        }));
        return existing;
      }
      return get().createDocument(input);
    },

    queueUpdate: (documentId, patch) => {
      const queue = queueFor(documentId);
      queue.pending = { ...queue.pending, ...patch };
      set((state) => {
        const current = state.documents[documentId];
        return current
          ? {
              documents: {
                ...state.documents,
                [documentId]: { ...current, ...patch },
              },
            }
          : state;
      });
      void saveNext(documentId);
    },

    deleteDocument: async (documentId) => {
      const deleted = await documentApi.delete(documentId);
      if (deleted) {
        set((state) => {
          const documents = { ...state.documents };
          delete documents[documentId];
          return { documents, error: null };
        });
      }
      return deleted;
    },

    restoreDocument: async (documentId) => {
      const document = await documentApi.restore(documentId);
      if (document) {
        set((state) => ({
          documents: {
            ...state.documents,
            [document.documentId]: document,
          },
          error: null,
        }));
      }
      return document;
    },
  };
});
