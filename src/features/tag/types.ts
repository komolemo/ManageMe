export type Tag = {
  tagId: string;
  name: string;
  colorId: number | null;
  description: string;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  documentCount: number;
};

export type CreateTagInput = Pick<
  Tag,
  "tagId" | "name" | "colorId" | "description"
>;

export type UpdateTagInput = Pick<
  Tag,
  "name" | "colorId" | "description"
>;
