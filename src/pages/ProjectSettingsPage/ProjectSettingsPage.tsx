import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type PointerEvent,
} from "react";
import { Trash2 } from "lucide-react";
import { EditableName2 } from "@/components/app/EditableName";
import { BucketInput } from "@/pages/ProjectSettingsPage/BucketInput";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";
import type {
  BucketStatus,
  ProjectBucket,
  ProjectMilestone,
} from "@/pages/projectData";
import type { PageKey } from "@/pages/pageTypes";

const bucketDragHoldMs = 280;

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
  onReorderBucket: (sourceBucketId: string, targetBucketId: string) => void;
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
  onUpdateBucketStatus,
}: ProjectSettingsPageProps) {
  const [newBucketName, setNewBucketName] = useState("");
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragReadyBucketId, setDragReadyBucketId] = useState<string | null>(null);
  const [draggedBucketId, setDraggedBucketId] = useState<string | null>(null);
  const [dragOverBucketId, setDragOverBucketId] = useState<string | null>(null);
  const dragHoldTimerRef = useRef<number | null>(null);

  const clearBucketDragHold = () => {
    if (dragHoldTimerRef.current !== null) {
      window.clearTimeout(dragHoldTimerRef.current);
      dragHoldTimerRef.current = null;
    }
  };

  const prepareBucketDrag = (
    event: PointerEvent<HTMLButtonElement>,
    bucketId: string
  ) => {
    if (event.button !== 0) {
      return;
    }

    clearBucketDragHold();
    dragHoldTimerRef.current = window.setTimeout(() => {
      setDragReadyBucketId(bucketId);
    }, bucketDragHoldMs);
  };

  const cancelBucketDragPreparation = () => {
    clearBucketDragHold();

    if (!draggedBucketId) {
      setDragReadyBucketId(null);
    }
  };

  const startBucketDrag = (
    event: DragEvent<HTMLButtonElement>,
    bucketId: string
  ) => {
    if (dragReadyBucketId !== bucketId) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", bucketId);
    setDraggedBucketId(bucketId);
  };

  const dragBucketOver = (
    event: DragEvent<HTMLDivElement>,
    bucketId: string
  ) => {
    if (!draggedBucketId || draggedBucketId === bucketId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverBucketId(bucketId);
  };

  const dropBucket = (event: DragEvent<HTMLDivElement>, bucketId: string) => {
    event.preventDefault();

    if (draggedBucketId && draggedBucketId !== bucketId) {
      onReorderBucket(draggedBucketId, bucketId);
    }

    clearBucketDragState();
  };

  const clearBucketDragState = () => {
    clearBucketDragHold();
    setDragReadyBucketId(null);
    setDraggedBucketId(null);
    setDragOverBucketId(null);
  };

  const addBucket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onAddBucket(newBucketName)) {
      setErrorMessage("Bucket name is empty or duplicated.");
      return;
    }

    setNewBucketName("");
    setErrorMessage("");
  };

  const addMilestone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onAddMilestone(newMilestoneName)) {
      setErrorMessage("Milestone name is empty or duplicated.");
      return;
    }

    setNewMilestoneName("");
    setErrorMessage("");
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
        { label: "Projects", onClick: () => onNavigate("projects") },
        { label: "2", onClick: () => onNavigate("project") },
        { label: "Project Settings" },
      ]}
    >
      <div className="grid h-full min-h-0 gap-[8px]">
        <header className="grid gap-[4px]">
          <h3 className="text-lg font-semibold">Project Settings</h3>
        </header>

        {errorMessage ? (
          <div className="border border-destructive/40 bg-destructive/10 px-[10px] py-[6px] text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-[6px]">
          <div className="flex justify-between items-center gap-[8px]">
            <div className="font-medium text-[14px]">Bucket</div>
          </div>

          <div className="divide-y grid gap-[4px]">
            {buckets.map((bucket) => (
              <BucketInput
                bucket={bucket}
                dragOverBucketId={dragOverBucketId}
                dragReadyBucketId={dragReadyBucketId}
                key={bucket.id}
                onCancelDragPreparation={cancelBucketDragPreparation}
                onClearDragState={clearBucketDragState}
                onDeleteBucket={deleteBucket}
                onDragOverBucket={dragBucketOver}
                onDropBucket={dropBucket}
                onPrepareDrag={prepareBucketDrag}
                onRenameBucket={renameBucket}
                onStartDrag={startBucketDrag}
                onUpdateBucketStatus={onUpdateBucketStatus}
              />
            ))}
            <form
              className="grid min-h-[36px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[8px] pr-[4px]"
              onSubmit={addBucket}
            >
              <Input
                aria-label="New milestone name"
                className="h-[26px] min-w-0 border-0 px-[6px] py-[0px] focus-visible:ring-0"
                onChange={(event) => setNewBucketName(event.target.value)}
                placeholder="Add milestone"
                value={newMilestoneName}
              />
            </form>
          </div>
        </section>

        <section className="grid gap-[6px]">
          <div className="flex justify-between items-center gap-[8px]">
            <div className="font-medium text-[14px]">Milestone</div>
          </div>

          <div className="divide-y grid gap-[4px]">
            {milestones.map((milestone) => (
              <div
                className="grid min-h-[36px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[8px] border-b pb-[4px] pr-[4px]"
                key={milestone.id}
              >
                <EditableName2
                  autoResize={false}
                  className="h-[26px] min-h-[26px] w-full px-[8px] py-[0px] font-sans text-[14px] font-normal leading-[24px]"
                  name={milestone.name}
                  onSaveEditing={(name) => renameMilestone(milestone.id, name)}
                  resetKey={milestone.name}
                />
                <div className="flex gap-[12px] items-center">
                  <Trash2
                    aria-label="Delete milestone"
                    className="size-[20px] cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => deleteMilestone(milestone.id)}
                    role="button"
                  />
                </div>
              </div>
            ))}
            <form
              className="grid min-h-[36px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[8px] pr-[4px]"
              onSubmit={addMilestone}
            >
              <Input
                aria-label="New milestone name"
                className="h-[26px] min-w-0 border-0 px-[6px] py-[0px] focus-visible:ring-0"
                onChange={(event) => setNewMilestoneName(event.target.value)}
                placeholder="Add milestone"
                value={newMilestoneName}
              />
            </form>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
