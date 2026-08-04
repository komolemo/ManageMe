export type Revision = {
  id: string;
  kind: "task" | "document";
  title: string;
  updatedAt: string;
};
