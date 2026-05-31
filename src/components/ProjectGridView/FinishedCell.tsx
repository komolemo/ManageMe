import { memo } from "react";
import { ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type FinishedCellProps = {
  depth: number;
  hasChildTasks: boolean;
  isExpanded: boolean;
  isFinished: boolean;
  onToggleTaskExpansion: (taskId: string) => void;
  taskId: string;
};

export const FinishedCell = memo(function FinishedCell({
  depth,
  hasChildTasks,
  isExpanded,
  isFinished,
  onToggleTaskExpansion,
  taskId,
}: FinishedCellProps) {
  const childMarkerSlot = depth > 0 ? Math.min(depth - 1, 1) : null;
  const expandButtonSlot = hasChildTasks ? Math.min(depth, 1) : null;

  const renderNotationSlot = (slotIndex: number) => {
    if (expandButtonSlot === slotIndex) {
      return (
        <Button
          aria-label={isExpanded ? "Collapse child tasks" : "Expand child tasks"}
          className="size-[20px] shrink-0 rounded-sm border-0 bg-transparent p-[0px] hover:bg-muted"
          onClick={(event) => {
            event.stopPropagation();
            onToggleTaskExpansion(taskId);
          }}
          type="button"
          variant="ghost"
        >
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      );
    }

    if (childMarkerSlot === slotIndex) {
      return (
        <CornerDownRight
          aria-hidden
          className="size-4 text-muted-foreground"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-w-0 items-center gap-[4px]">
      {[0, 1].map((slotIndex) => (
        <div
          className="flex size-[20px] shrink-0 items-center justify-center"
          key={slotIndex}
        >
          {renderNotationSlot(slotIndex)}
        </div>
      ))}
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        <Checkbox checked={isFinished} />
      </div>
    </div>
  );
});
