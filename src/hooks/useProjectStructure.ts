import { useEffect, useMemo } from "react";
import { useBucketStore } from "@/features/bucket/bucketStore";
import { useMilestoneStore } from "@/features/milestone/milestoneStore";
import type {
  BucketStatus,
  ProjectBucket,
  ProjectMilestone,
  ProjectTask,
} from "@/features/task/projectTypes";
import type { DropPosition } from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { useWorkspaceTasks } from "@/hooks/useTasks";

type UseProjectStructureOptions = {
  workspaceId?: string;
};

function mapProjectTasks(
  currentTasks: ProjectTask[],
  updateTask: (task: ProjectTask) => ProjectTask,
): ProjectTask[] {
  return currentTasks.map((task) => {
    const nextTask = updateTask(task);
    return nextTask.children?.length
      ? {
          ...nextTask,
          children: mapProjectTasks(nextTask.children, updateTask),
        }
      : nextTask;
  });
}

function hasDuplicateName(
  items: Array<{ id: string; name: string }>,
  name: string,
  ignoredId?: string,
) {
  const normalizedName = name.trim().toLowerCase();
  return items.some(
    (item) =>
      item.id !== ignoredId && item.name.trim().toLowerCase() === normalizedName,
  );
}

export function useProjectStructure({
  workspaceId,
}: UseProjectStructureOptions) {
  const storedBuckets = useBucketStore((state) => state.buckets);
  const loadBuckets = useBucketStore((state) => state.loadBuckets);
  const createBucket = useBucketStore((state) => state.createBucket);
  const updateBucket = useBucketStore((state) => state.updateBucket);
  const reorderBuckets = useBucketStore((state) => state.reorderBuckets);
  const deleteBucket = useBucketStore((state) => state.deleteBucket);
  const storedMilestones = useMilestoneStore((state) => state.milestones);
  const loadMilestones = useMilestoneStore((state) => state.loadMilestones);
  const createMilestone = useMilestoneStore((state) => state.createMilestone);
  const updateMilestone = useMilestoneStore((state) => state.updateMilestone);
  const reorderMilestones = useMilestoneStore((state) => state.reorderMilestones);
  const deleteMilestone = useMilestoneStore((state) => state.deleteMilestone);

  const milestones = useMemo<ProjectMilestone[]>(
    () =>
      storedMilestones.map((milestone) => ({
        id: milestone.milestoneId,
        name: milestone.name,
      })),
    [storedMilestones],
  );
  const buckets = useMemo<ProjectBucket[]>(
    () =>
      storedBuckets
        .map((bucket) => ({
          id: bucket.bucketId,
          name: bucket.name,
          order: bucket.displayOrder,
          status: bucket.statusType,
        }))
        .sort((a, b) => a.order - b.order),
    [storedBuckets],
  );
  const { projectTasks, setProjectTasks } = useWorkspaceTasks(
    workspaceId,
    buckets,
    milestones,
  );

  useEffect(() => {
    if (!workspaceId) return;
    void loadMilestones(workspaceId).catch(() => undefined);
    void loadBuckets(workspaceId).catch(() => undefined);
  }, [loadBuckets, loadMilestones, workspaceId]);

  const addBucket = (name: string) => {
    const nextName = name.trim();
    if (!workspaceId || !nextName || hasDuplicateName(buckets, nextName)) {
      return false;
    }
    void createBucket({
      bucketId: crypto.randomUUID(),
      workspaceId,
      name: nextName,
      statusType: 0,
    }).catch(() => undefined);
    return true;
  };

  const renameBucket = (bucketId: string, name: string) => {
    const nextName = name.trim();
    const bucket = buckets.find((item) => item.id === bucketId);
    if (!bucket || !nextName || hasDuplicateName(buckets, nextName, bucketId)) {
      return false;
    }
    void updateBucket(bucketId, { name: nextName, statusType: bucket.status })
      .then((updated) => {
        if (updated) {
          setProjectTasks((tasks) =>
            mapProjectTasks(tasks, (task) =>
              task.bucket === bucket.name ? { ...task, bucket: nextName } : task,
            ),
          );
        }
      })
      .catch(() => undefined);
    return true;
  };

  const deleteProjectBucket = (bucketId: string) => {
    if (buckets.length <= 1) return false;
    const deletedBucket = buckets.find((bucket) => bucket.id === bucketId);
    const fallbackBucket = buckets.find((bucket) => bucket.id !== bucketId);
    if (!deletedBucket || !fallbackBucket) return false;

    void deleteBucket(bucketId)
      .then((deleted) => {
        if (deleted) {
          setProjectTasks((tasks) =>
            mapProjectTasks(tasks, (task) =>
              (task.bucket ?? buckets[0]?.name ?? "") === deletedBucket.name
                ? { ...task, bucket: fallbackBucket.name }
                : task,
            ),
          );
        }
      })
      .catch(() => undefined);
    return true;
  };

  const reorderBucket = (
    sourceBucketId: string,
    targetBucketId: string,
    position: DropPosition,
  ) => {
    if (!workspaceId) return;
    const nextBuckets = [...buckets];
    const sourceIndex = nextBuckets.findIndex(({ id }) => id === sourceBucketId);
    const targetIndex = nextBuckets.findIndex(({ id }) => id === targetBucketId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const [sourceBucket] = nextBuckets.splice(sourceIndex, 1);
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextBuckets.splice(
      position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      sourceBucket,
    );
    void reorderBuckets(workspaceId, nextBuckets.map(({ id }) => id)).catch(
      () => undefined,
    );
  };

  const updateBucketStatus = (bucketId: string, status: BucketStatus) => {
    const bucket = buckets.find(({ id }) => id === bucketId);
    if (!bucket) return;
    void updateBucket(bucketId, { name: bucket.name, statusType: status }).catch(
      () => undefined,
    );
  };

  const addMilestone = (name: string) => {
    const nextName = name.trim();
    if (!workspaceId || !nextName || hasDuplicateName(milestones, nextName)) {
      return false;
    }
    void createMilestone({
      milestoneId: crypto.randomUUID(),
      workspaceId,
      name: nextName,
    }).catch(() => undefined);
    return true;
  };

  const renameMilestone = (milestoneId: string, name: string) => {
    const nextName = name.trim();
    const milestone = milestones.find(({ id }) => id === milestoneId);
    if (
      !milestone ||
      !nextName ||
      hasDuplicateName(milestones, nextName, milestoneId)
    ) {
      return false;
    }
    void updateMilestone(milestoneId, nextName)
      .then((updated) => {
        if (updated) {
          setProjectTasks((tasks) =>
            mapProjectTasks(tasks, (task) =>
              task.milestone === milestone.name
                ? { ...task, milestone: nextName }
                : task,
            ),
          );
        }
      })
      .catch(() => undefined);
    return true;
  };

  const deleteProjectMilestone = (milestoneId: string) => {
    if (milestones.length <= 1) return false;
    const deletedMilestone = milestones.find(({ id }) => id === milestoneId);
    const fallbackMilestone = milestones.find(({ id }) => id !== milestoneId);
    if (!deletedMilestone || !fallbackMilestone) return false;

    void deleteMilestone(milestoneId)
      .then((deleted) => {
        if (deleted) {
          setProjectTasks((tasks) =>
            mapProjectTasks(tasks, (task) =>
              task.milestone === deletedMilestone.name
                ? { ...task, milestone: fallbackMilestone.name }
                : task,
            ),
          );
        }
      })
      .catch(() => undefined);
    return true;
  };

  const reorderMilestone = (
    sourceMilestoneId: string,
    targetMilestoneId: string,
    position: DropPosition,
  ) => {
    if (!workspaceId) return;
    const nextMilestones = [...milestones];
    const sourceIndex = nextMilestones.findIndex(({ id }) => id === sourceMilestoneId);
    const targetIndex = nextMilestones.findIndex(({ id }) => id === targetMilestoneId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const [sourceMilestone] = nextMilestones.splice(sourceIndex, 1);
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextMilestones.splice(
      position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      sourceMilestone,
    );
    void reorderMilestones(workspaceId, nextMilestones.map(({ id }) => id)).catch(
      () => undefined,
    );
  };

  return {
    addBucket,
    addMilestone,
    buckets,
    deleteBucket: deleteProjectBucket,
    deleteMilestone: deleteProjectMilestone,
    milestones,
    projectTasks,
    renameBucket,
    renameMilestone,
    reorderBucket,
    reorderMilestone,
    updateBucketStatus,
    setProjectTasks,
  };
}

export type ProjectStructure = ReturnType<typeof useProjectStructure>;
