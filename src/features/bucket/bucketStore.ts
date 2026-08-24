import { create } from "zustand";
import { bucketApi } from "@/features/bucket/bucketApi";
import type {
  Bucket,
  CreateBucketInput,
  UpdateBucketInput,
} from "@/features/bucket/types";

type BucketStore = {
  buckets: Bucket[];
  error: string | null;
  loadingWorkspaceId: string | null;
  createBucket: (input: CreateBucketInput) => Promise<Bucket>;
  deleteBucket: (bucketId: string) => Promise<boolean>;
  loadBuckets: (workspaceId: string) => Promise<void>;
  reorderBuckets: (
    workspaceId: string,
    bucketIds: string[],
  ) => Promise<Bucket[]>;
  updateBucket: (
    bucketId: string,
    input: UpdateBucketInput,
  ) => Promise<Bucket | null>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const useBucketStore = create<BucketStore>((set) => ({
  buckets: [],
  error: null,
  loadingWorkspaceId: null,

  loadBuckets: async (workspaceId) => {
    set({ buckets: [], error: null, loadingWorkspaceId: workspaceId });
    try {
      set({ buckets: await bucketApi.list(workspaceId) });
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    } finally {
      set({ loadingWorkspaceId: null });
    }
  },

  createBucket: async (input) => {
    set({ error: null });
    try {
      const bucket = await bucketApi.create(input);
      set((state) => ({ buckets: [...state.buckets, bucket] }));
      return bucket;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateBucket: async (bucketId, input) => {
    set({ error: null });
    try {
      const bucket = await bucketApi.update(bucketId, input);
      if (bucket) {
        set((state) => ({
          buckets: state.buckets.map((item) =>
            item.bucketId === bucketId ? bucket : item
          ),
        }));
      }
      return bucket;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  reorderBuckets: async (workspaceId, bucketIds) => {
    set({ error: null });
    try {
      const buckets = await bucketApi.reorder(workspaceId, bucketIds);
      set({ buckets });
      return buckets;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  deleteBucket: async (bucketId) => {
    set({ error: null });
    try {
      const deleted = await bucketApi.delete(bucketId);
      if (deleted) {
        set((state) => ({
          buckets: state.buckets.filter((item) => item.bucketId !== bucketId),
        }));
      }
      return deleted;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },
}));
