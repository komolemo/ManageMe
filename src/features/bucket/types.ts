export const BUCKET_STATUS = {
  UNRESOLVED: 0,
  IN_PROGRESS: 50,
  COMPLETED: 100,
} as const;

export type BucketStatus =
  (typeof BUCKET_STATUS)[keyof typeof BUCKET_STATUS];

export type Bucket = {
  bucketId: string;
  workspaceId: string;
  name: string;
  statusType: BucketStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBucketInput = Pick<
  Bucket,
  "bucketId" | "workspaceId" | "name" | "statusType"
>;

export type UpdateBucketInput = Pick<Bucket, "name" | "statusType">;
