import { memo, useRef, type PointerEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { EditableName2 } from "@/components/app/EditableName";
import type { ProjectMilestone } from "@/features/task/projectTypes";
import type { DropPosition } from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type MilestoneInputProps = {
  draggedMilestoneId: string | null;
  dragGroupId: string;
  dragOverMilestoneId: string | null;
  dropPosition: DropPosition;
  milestone: ProjectMilestone;
  nextMilestoneId?: string;
  rowIndex: number;
  onClearDragState: () => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onEndDrag: (event: PointerEvent<HTMLButtonElement>) => void;
  onMoveMilestone: (event: PointerEvent<HTMLButtonElement>) => void;
  onRenameMilestone: (milestoneId: string, name: string) => void;
  onStartDrag: (
    event: PointerEvent<HTMLButtonElement>,
    milestoneId: string,
    milestoneElement: HTMLDivElement | null
  ) => void;
};

export const MilestoneInput = memo(function MilestoneInput({
  draggedMilestoneId,
  dragGroupId,
  dragOverMilestoneId,
  dropPosition,
  milestone,
  nextMilestoneId,
  rowIndex,
  onClearDragState,
  onDeleteMilestone,
  onEndDrag,
  onMoveMilestone,
  onRenameMilestone,
  onStartDrag,
}: MilestoneInputProps) {
  const { t } = useTranslation();
  const milestoneInputRef = useRef<HTMLDivElement>(null);
  const isDragOverMilestone =
    dragOverMilestoneId === milestone.id && draggedMilestoneId !== milestone.id;
  const isBeforeFirstMilestone =
    rowIndex === 0 && isDragOverMilestone && dropPosition === "before";
  const isAfterMilestone = isDragOverMilestone && dropPosition === "after";
  const isBeforeNextMilestone =
    nextMilestoneId === dragOverMilestoneId &&
    draggedMilestoneId !== dragOverMilestoneId &&
    dropPosition === "before";
  const dropBorderClass =
    isBeforeFirstMilestone ? "border-t-primary" :
    isAfterMilestone || isBeforeNextMilestone ? "border-b-primary" : "";

  return (
    <div
      className={cn(
        "grid min-h-[36px] grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-[8px] border-y-2 border-transparent pb-[4px] pr-[4px]",
        dropBorderClass,
        draggedMilestoneId === milestone.id && "opacity-75"
      )}
      data-settings-dnd-group={dragGroupId}
      data-settings-dnd-item={milestone.id}
      ref={milestoneInputRef}
    >
      <button
        aria-label={t("projectSettings.dragMilestone", { milestoneName: milestone.name })}
        className="grid size-[20px] touch-none select-none cursor-grab place-items-center border-0 bg-transparent p-[0px] text-muted-foreground hover:text-foreground active:cursor-grabbing active:text-foreground"
        onPointerCancel={() => onClearDragState()}
        onPointerDown={(event) => {
          onStartDrag(event, milestone.id, milestoneInputRef.current);
        }}
        onPointerMove={onMoveMilestone}
        onPointerUp={onEndDrag}
        type="button"
      >
        <GripVertical className="size-[18px]" />
      </button>
      <EditableName2
        autoResize={false}
        className="h-[26px] min-h-[26px] w-full px-[8px] py-[0px] font-sans text-[14px] font-normal leading-[24px]"
        name={milestone.name}
        onSaveEditing={(name) => onRenameMilestone(milestone.id, name)}
        resetKey={milestone.name}
      />
      <div className="flex gap-[12px] items-center">
        <Trash2
          aria-label={t("projectSettings.deleteMilestone")}
          className="size-[20px] cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onDeleteMilestone(milestone.id)}
          role="button"
        />
      </div>
    </div>
  );
});
