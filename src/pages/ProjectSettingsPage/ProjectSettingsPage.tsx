import {
  useState,
  type FormEvent,
} from "react";
import { BucketInput } from "@/pages/ProjectSettingsPage/BucketInput";
import { MilestoneInput } from "@/pages/ProjectSettingsPage/MilestoneInput";
import {
  useSettingsListDragAndDrop,
  type DropPosition,
} from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { GripVertical, Trash2 } from "lucide-react";
import config from "@/config.json";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageShell } from "@/pages/PageShell";
import type {
  BucketStatus,
  ProjectBucket,
  ProjectMilestone,
} from "@/pages/projectData";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";
import { useMilestoneStore } from "@/features/milestone/milestoneStore";

const bucketStatusLabels = config.bucketStatusLabels as Record<
  `${BucketStatus}`,
  string
>;

type ProjectSettingsPageProps = {
  buckets: ProjectBucket[];
  milestones: ProjectMilestone[];
  onAddBucket: (name: string) => boolean;
  onAddMilestone: (name: string) => boolean;
  onDeleteBucket: (bucketId: string) => boolean;
  onDeleteMilestone: (milestoneId: string) => boolean;
  onNavigate: (page: PageKey) => void;
  onRenameBucket: (bucketId: string, name: string) => boolean;
  onRenameMilestone: (milestoneId: string, name: string) => boolean;
  onReorderBucket: (
    sourceBucketId: string,
    targetBucketId: string,
    position: DropPosition
  ) => void;
  onReorderMilestone: (
    sourceMilestoneId: string,
    targetMilestoneId: string,
    position: DropPosition
  ) => void;
  onUpdateBucketStatus: (bucketId: string, status: BucketStatus) => void;
};

export function ProjectSettingsPage({
  buckets,
  milestones,
  onAddBucket,
  onAddMilestone,
  onDeleteBucket,
  onDeleteMilestone,
  onNavigate,
  onRenameBucket,
  onRenameMilestone,
  onReorderBucket,
  onReorderMilestone,
  onUpdateBucketStatus,
}: ProjectSettingsPageProps) {
  const { t } = useTranslation();
  const milestoneError = useMilestoneStore((state) => state.error);
  const isLoadingMilestones = useMilestoneStore(
    (state) => state.loadingWorkspaceId !== null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const {
    clearDragState: clearBucketDragState,
    dragPreview: bucketDragPreview,
    draggedItemId: draggedBucketId,
    dragOverItemId: dragOverBucketId,
    dropPosition: bucketDropPosition,
    dragGroupId: bucketDragGroupId,
    handlePointerDown: startBucketDrag,
    handlePointerMove: moveBucketDrag,
    handlePointerUp: endBucketDrag,
  } = useSettingsListDragAndDrop(onReorderBucket);
  const {
    clearDragState: clearMilestoneDragState,
    dragPreview: milestoneDragPreview,
    draggedItemId: draggedMilestoneId,
    dragOverItemId: dragOverMilestoneId,
    dropPosition: milestoneDropPosition,
    dragGroupId: milestoneDragGroupId,
    handlePointerDown: startMilestoneDrag,
    handlePointerMove: moveMilestoneDrag,
    handlePointerUp: endMilestoneDrag,
  } = useSettingsListDragAndDrop(onReorderMilestone);

  const addBucket = (name: string) => {
    if (!onAddBucket(name)) {
      setErrorMessage("Bucket name is empty or duplicated.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const addMilestone = (name: string) => {
    if (!onAddMilestone(name)) {
      setErrorMessage("Milestone name is empty or duplicated.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const renameBucket = (bucketId: string, name: string) => {
    if (!onRenameBucket(bucketId, name)) {
      setErrorMessage("Bucket name is empty or duplicated.");
      return;
    }

    setErrorMessage("");
  };

  const renameMilestone = (milestoneId: string, name: string) => {
    if (!onRenameMilestone(milestoneId, name)) {
      setErrorMessage("Milestone name is empty or duplicated.");
      return;
    }

    setErrorMessage("");
  };

  const deleteBucket = (bucketId: string) => {
    if (!onDeleteBucket(bucketId)) {
      setErrorMessage("Keep at least one Bucket.");
      return;
    }

    setErrorMessage("");
  };

  const deleteMilestone = (milestoneId: string) => {
    if (!onDeleteMilestone(milestoneId)) {
      setErrorMessage("Keep at least one Milestone.");
      return;
    }

    setErrorMessage("");
  };

  return (
    <PageShell
      breadcrumbs={[
        { label: t("pages.projects"), onClick: () => onNavigate("projects") },
        { label: "2", onClick: () => onNavigate("project") },
        { label: t("pages.projectSettings") },
      ]}
    >
      <div
        className="grid min-h-0 gap-[8px]"
        style={{ marginInline: "auto", width: "min(100%, 520px)" }}
      >
        <header className="grid gap-[4px]">
          <h3 className="text-lg font-semibold">{t("projectSettings.title")}</h3>
        </header>

        {errorMessage || milestoneError ? (
          <div className="border border-destructive/40 bg-destructive/10 px-[10px] py-[6px] text-destructive">
            {errorMessage || milestoneError}
          </div>
        ) : null}

        <section className="grid gap-[6px]">
          <div className="flex justify-between items-center gap-[8px]">
            <div className="font-medium text-[14px]">{t("projectSettings.bucket")}</div>
          </div>

          <div className="divide-y grid gap-[4px]">
            {buckets.map((bucket, bucketIndex) => (
              <BucketInput
                bucket={bucket}
                draggedBucketId={draggedBucketId}
                dragGroupId={bucketDragGroupId}
                dragOverBucketId={dragOverBucketId}
                dropPosition={bucketDropPosition}
                key={bucket.id}
                nextBucketId={buckets[bucketIndex + 1]?.id}
                onClearDragState={clearBucketDragState}
                onDeleteBucket={deleteBucket}
                onMoveBucket={moveBucketDrag}
                onEndDrag={endBucketDrag}
                onRenameBucket={renameBucket}
                onStartDrag={startBucketDrag}
                onUpdateBucketStatus={onUpdateBucketStatus}
                rowIndex={bucketIndex}
              />
            ))}
            <NewSettingInput
              ariaLabel={t("projectSettings.newBucketName")}
              onAddName={addBucket}
              placeholder={t("projectSettings.addBucket")}
            />
          </div>
        </section>

        <div className="py-[8px]">
          <Separator/>
        </div>

        <section className="grid gap-[6px]">
          <div className="flex justify-between items-center gap-[8px]">
            <div className="font-medium text-[14px]">{t("projectSettings.milestone")}</div>
          </div>

          <div className="divide-y grid gap-[4px]">
            {isLoadingMilestones ? (
              <p className="px-[8px] py-[6px] text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : null}
            {milestones.map((milestone, milestoneIndex) => (
              <MilestoneInput
                draggedMilestoneId={draggedMilestoneId}
                dragGroupId={milestoneDragGroupId}
                dragOverMilestoneId={dragOverMilestoneId}
                dropPosition={milestoneDropPosition}
                key={milestone.id}
                milestone={milestone}
                nextMilestoneId={milestones[milestoneIndex + 1]?.id}
                onClearDragState={clearMilestoneDragState}
                onDeleteMilestone={deleteMilestone}
                onMoveMilestone={moveMilestoneDrag}
                onEndDrag={endMilestoneDrag}
                onRenameMilestone={renameMilestone}
                onStartDrag={startMilestoneDrag}
                rowIndex={milestoneIndex}
              />
            ))}
            <NewSettingInput
              ariaLabel={t("projectSettings.newMilestoneName")}
              onAddName={addMilestone}
              placeholder={t("projectSettings.addMilestone")}
            />
          </div>
        </section>
        {bucketDragPreview ? (
          <BucketDragPreview
            bucket={buckets.find((bucket) => bucket.id === bucketDragPreview.itemId)}
            left={bucketDragPreview.left}
            top={bucketDragPreview.top}
            width={bucketDragPreview.width}
          />
        ) : null}
        {milestoneDragPreview ? (
          <MilestoneDragPreview
            left={milestoneDragPreview.left}
            milestone={milestones.find(
              (milestone) => milestone.id === milestoneDragPreview.itemId
            )}
            top={milestoneDragPreview.top}
            width={milestoneDragPreview.width}
          />
        ) : null}
      </div>
    </PageShell>
  );
}

type BucketDragPreviewProps = {
  bucket?: ProjectBucket;
  left: number;
  top: number;
  width: number;
};

function BucketDragPreview({
  bucket,
  left,
  top,
  width,
}: BucketDragPreviewProps) {
  if (!bucket) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-50 grid min-h-[36px] items-center gap-[8px] border-y-2 border-transparent bg-card pb-[4px] pr-[4px] opacity-95 shadow-sm"
      style={{
        gridTemplateColumns: "20px minmax(0, 1fr) 132px auto",
        left,
        top,
        width,
      }}
    >
      <div className="grid size-[20px] place-items-center text-muted-foreground">
        <GripVertical className="size-[18px]" />
      </div>
      <div className="h-[26px] min-h-[26px] truncate px-[8px] py-[0px] font-sans text-[14px] font-normal leading-[24px]">
        {bucket.name}
      </div>
      <div className="h-[26px] min-w-0 px-[8px] text-[14px] leading-[26px]">
        {bucketStatusLabels[String(bucket.status) as `${BucketStatus}`]}
      </div>
      <div className="flex gap-[12px] items-center">
        <Trash2 className="size-[20px] text-muted-foreground" />
      </div>
    </div>
  );
}

type MilestoneDragPreviewProps = {
  left: number;
  milestone?: ProjectMilestone;
  top: number;
  width: number;
};

function MilestoneDragPreview({
  left,
  milestone,
  top,
  width,
}: MilestoneDragPreviewProps) {
  if (!milestone) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-50 grid min-h-[36px] grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-[8px] border-y-2 border-transparent bg-card pb-[4px] pr-[4px] opacity-95 shadow-sm"
      style={{ left, top, width }}
    >
      <div className="grid size-[20px] place-items-center text-muted-foreground">
        <GripVertical className="size-[18px]" />
      </div>
      <div className="h-[26px] min-h-[26px] truncate px-[8px] py-[0px] font-sans text-[14px] font-normal leading-[24px]">
        {milestone.name}
      </div>
      <div className="flex gap-[12px] items-center">
        <Trash2 className="size-[20px] text-muted-foreground" />
      </div>
    </div>
  );
}

type NewSettingInputProps = {
  ariaLabel: string;
  onAddName: (name: string) => boolean;
  placeholder: string;
};

function NewSettingInput({
  ariaLabel,
  onAddName,
  placeholder,
}: NewSettingInputProps) {
  const [name, setName] = useState("");

  const addName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onAddName(name)) {
      setName("");
    }
  };

  return (
    <form
      className="grid min-h-[36px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[8px] pr-[4px]"
      onSubmit={addName}
    >
      <Input
        aria-label={ariaLabel}
        className="h-[26px] min-w-0 border-0 px-[6px] py-[0px] focus-visible:ring-0"
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        value={name}
      />
    </form>
  );
}
