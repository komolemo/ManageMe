import { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectTask } from "@/pages/projectData";

type FinishedCellProps = {
  hasChildTasks: boolean;
  isExpanded: boolean;
  isFinished: boolean;
  onFinishedChange: (taskId: ProjectTask["id"], isFinished: boolean) => void;
  onToggleTaskExpansion: (taskId: ProjectTask["id"]) => void;
  taskId: ProjectTask["id"];
};

export const FinishedCell = memo(function FinishedCell({
  hasChildTasks,
  isExpanded,
  isFinished,
  onFinishedChange,
  onToggleTaskExpansion,
  taskId,
}: FinishedCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-[4px]">
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        {hasChildTasks ? (
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
        ) : null}
      </div>
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        <Checkbox
          checked={isFinished}
          onCheckedChange={(checked) => onFinishedChange(taskId, checked === true)}
        />
      </div>
    </div>
  );
});
