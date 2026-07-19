export type BucketStatus = 0 | 50 | 100;

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
