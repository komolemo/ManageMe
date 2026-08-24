import { memo, useRef, type PointerEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { EditableName2 } from "@/components/app/EditableName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BUCKET_STATUS,
  type BucketStatus,
} from "@/features/bucket/types";
import type { ProjectBucket } from "@/features/task/projectTypes";
import type { DropPosition } from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type BucketStatusSelectProps = {
  bucket: ProjectBucket;
  onUpdateStatus: (bucketId: string, status: BucketStatus) => void;
};

const bucketStatuses = Object.values(BUCKET_STATUS);

function BucketStatusSelect({ bucket, onUpdateStatus }: BucketStatusSelectProps) {
  const { t } = useTranslation();
  return (
    <Select
      onValueChange={(value) =>
        onUpdateStatus(bucket.id, Number(value) as BucketStatus)
      }
      value={String(bucket.status)}
    >
      <SelectTrigger className="h-[26px] w-full min-w-0 border-0 bg-transparent px-[8px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {bucketStatuses.map((status) => (
          <SelectItem key={status} value={String(status)}>
            {t(`bucketStatus.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type BucketInputProps = {
  bucket: ProjectBucket;
  dragGroupId: string;
  draggedBucketId: string | null;
  dragOverBucketId: string | null;
  dropPosition: DropPosition;
  nextBucketId?: string;
  rowIndex: number;
  onClearDragState: () => void;
  onDeleteBucket: (bucketId: string) => void;
  onEndDrag: (event: PointerEvent<HTMLButtonElement>) => void;
  onMoveBucket: (event: PointerEvent<HTMLButtonElement>) => void;
  onRenameBucket: (bucketId: string, name: string) => void;
  onStartDrag: (
    event: PointerEvent<HTMLButtonElement>,
    bucketId: string,
    bucketElement: HTMLDivElement | null
  ) => void;
  onUpdateBucketStatus: (bucketId: string, status: BucketStatus) => void;
};

export const BucketInput = memo(function BucketInput({
  bucket,
  dragGroupId,
  draggedBucketId,
  dragOverBucketId,
  dropPosition,
  nextBucketId,
  rowIndex,
  onClearDragState,
  onDeleteBucket,
  onEndDrag,
  onMoveBucket,
  onRenameBucket,
  onStartDrag,
  onUpdateBucketStatus,
}: BucketInputProps) {
  const { t } = useTranslation();
  const bucketInputRef = useRef<HTMLDivElement>(null);
  const isDragOverBucket = dragOverBucketId === bucket.id && draggedBucketId !== bucket.id;
  const isBeforeFirstBucket =
    rowIndex === 0 && isDragOverBucket && dropPosition === "before";
  const isAfterBucket = isDragOverBucket && dropPosition === "after";
  const isBeforeNextBucket =
    nextBucketId === dragOverBucketId &&
    draggedBucketId !== dragOverBucketId &&
    dropPosition === "before";
  const dropBorderClass =
    isBeforeFirstBucket ? "border-t-primary" :
    isAfterBucket || isBeforeNextBucket ? "border-b-primary" : "";

  return (
    <div
      className={cn(
        "grid min-h-[36px] items-center gap-[8px] border-y-2 border-transparent pb-[4px] pr-[4px]",
        dropBorderClass,
        draggedBucketId === bucket.id && "opacity-75"
      )}
      data-settings-dnd-group={dragGroupId}
      data-settings-dnd-item={bucket.id}
      ref={bucketInputRef}
      style={{ gridTemplateColumns: "20px minmax(0, 1fr) 132px auto" }}
    >
      <button
        aria-label={t("projectSettings.dragBucket", { bucketName: bucket.name })}
        className="grid size-[20px] touch-none select-none cursor-grab place-items-center border-0 bg-transparent p-[0px] text-muted-foreground hover:text-foreground active:cursor-grabbing active:text-foreground"
        onPointerCancel={() => onClearDragState()}
        onPointerDown={(event) => {
          onStartDrag(event, bucket.id, bucketInputRef.current);
        }}
        onPointerMove={onMoveBucket}
        onPointerUp={onEndDrag}
        type="button"
      >
        <GripVertical className="size-[18px]" />
      </button>
      <EditableName2
        autoResize={false}
        className="h-[26px] min-h-[26px] w-full px-[8px] py-[0px] font-sans text-[14px] font-normal leading-[24px]"
        name={bucket.name}
        onSaveEditing={(name) => onRenameBucket(bucket.id, name)}
        resetKey={bucket.name}
      />
      <BucketStatusSelect
        bucket={bucket}
        onUpdateStatus={onUpdateBucketStatus}
      />
      <div className="flex gap-[12px] items-center">
        <Trash2
          aria-label={t("projectSettings.deleteBucket")}
          className="size-[20px] cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onDeleteBucket(bucket.id)}
          role="button"
        />
      </div>
    </div>
  );
});
