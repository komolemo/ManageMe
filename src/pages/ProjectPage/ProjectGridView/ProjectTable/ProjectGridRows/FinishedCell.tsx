import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectTask } from "@/features/task/projectTypes";

type FinishedCellProps = {
  isExpanded: boolean;
  onToggleExpansion: (taskId: ProjectTask["id"]) => void;
  task: ProjectTask;
};

export function FinishedCell({
  isExpanded,
  onToggleExpansion,
  task,
}: FinishedCellProps) {
  const { t } = useTranslation();
  const [isFinished, setIsFinished] = useState(task.isFinished);
  return (
    <div className="flex min-w-0 items-center gap-[4px]">
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        {task.children?.length ? (
          <Button
            aria-label={
              isExpanded
                ? t("project.collapseChildren")
                : t("project.expandChildren")
            }
            className="size-[20px] shrink-0 rounded-sm border-0 bg-transparent p-0 hover:bg-muted"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpansion(task.id);
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
          onCheckedChange={(checked) => setIsFinished(checked === true)}
        />
      </div>
    </div>
  );
}
