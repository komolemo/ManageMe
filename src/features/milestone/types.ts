export type Milestone = {
  milestoneId: string;
  workspaceId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMilestoneInput = Pick<
  Milestone,
  "milestoneId" | "workspaceId" | "name"
>;
