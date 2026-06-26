import { type DragEvent, type PointerEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { EditableName2 } from "@/components/app/EditableName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BucketStatus, ProjectBucket } from "@/pages/projectData";
import { cn } from "@/lib/utils";

const bucketStatusOptions: BucketStatus[] = [0, 50, 100];

type BucketStatusSelectProps = {
  bucket: ProjectBucket;
  onUpdateStatus: (bucketId: string, status: BucketStatus) => void;
};

function BucketStatusSelect({ bucket, onUpdateStatus }: BucketStatusSelectProps) {
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
        {bucketStatusOptions.map((status) => (
          <SelectItem key={status} value={String(status)}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type BucketInputProps = {
  bucket: ProjectBucket;
  dragOverBucketId: string | null;
  dragReadyBucketId: string | null;
  onCancelDragPreparation: () => void;
  onClearDragState: () => void;
  onDeleteBucket: (bucketId: string) => void;
  onDragOverBucket: (event: DragEvent<HTMLDivElement>, bucketId: string) => void;
  onDropBucket: (event: DragEvent<HTMLDivElement>, bucketId: string) => void;
  onPrepareDrag: (
    event: PointerEvent<HTMLButtonElement>,
    bucketId: string
  ) => void;
  onRenameBucket: (bucketId: string, name: string) => void;
  onStartDrag: (event: DragEvent<HTMLButtonElement>, bucketId: string) => void;
  onUpdateBucketStatus: (bucketId: string, status: BucketStatus) => void;
};

export function BucketInput({
  bucket,
  dragOverBucketId,
  dragReadyBucketId,
  onCancelDragPreparation,
  onClearDragState,
  onDeleteBucket,
  onDragOverBucket,
  onDropBucket,
  onPrepareDrag,
  onRenameBucket,
  onStartDrag,
  onUpdateBucketStatus,
}: BucketInputProps) {
  return (
    <div
      className={cn(
        "grid min-h-[36px] items-center gap-[8px] border-b pb-[4px] pr-[4px]",
        dragOverBucketId === bucket.id && "bg-accent/40"
      )}
      onDragEnd={onClearDragState}
      onDragOver={(event) => onDragOverBucket(event, bucket.id)}
      onDrop={(event) => onDropBucket(event, bucket.id)}
      style={{ gridTemplateColumns: "20px minmax(0, 1fr) 132px auto" }}
    >
      <button
        aria-label={`Drag ${bucket.name} bucket`}
        className={cn(
          "grid size-[20px] cursor-grab place-items-center border-0 bg-transparent p-[0px] text-muted-foreground hover:text-foreground",
          dragReadyBucketId === bucket.id && "cursor-grabbing text-foreground"
        )}
        draggable={dragReadyBucketId === bucket.id}
        onDragStart={(event) => onStartDrag(event, bucket.id)}
        onPointerCancel={onCancelDragPreparation}
        onPointerDown={(event) => onPrepareDrag(event, bucket.id)}
        onPointerLeave={onCancelDragPreparation}
        onPointerUp={onCancelDragPreparation}
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
          aria-label="Delete bucket"
          className="size-[20px] cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onDeleteBucket(bucket.id)}
          role="button"
        />
      </div>
    </div>
  );
}
