import { invoke } from "@tauri-apps/api/core";
import type {
  Bucket,
  CreateBucketInput,
  UpdateBucketInput,
} from "@/features/bucket/types";

export const bucketApi = {
  create(input: CreateBucketInput) {
    return invoke<Bucket>("create_bucket", { input });
  },

  list(workspaceId: string) {
    return invoke<Bucket[]>("list_buckets", { workspaceId });
  },

  update(bucketId: string, input: UpdateBucketInput) {
    return invoke<Bucket | null>("update_bucket", { bucketId, input });
  },

  reorder(workspaceId: string, bucketIds: string[]) {
    return invoke<Bucket[]>("reorder_buckets", { workspaceId, bucketIds });
  },

  delete(bucketId: string) {
    return invoke<boolean>("delete_bucket", { bucketId });
  },
};
