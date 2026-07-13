import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

type TaskProgressProps = {
  completedCount: number;
  totalCount: number;
};

export function TaskProgress({
  completedCount,
  totalCount,
}: TaskProgressProps) {
  const { t } = useTranslation();
  const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const clampedProgressValue = Math.min(Math.max(progressValue, 0), 100);
  const progressLightness = 0.28 + (0.76 - 0.28) * (clampedProgressValue / 100);
  const progressColor = `oklch(${progressLightness.toFixed(3)} 0.17 145)`;

  return (
    <Badge
      className="w-full gap-[6px] border-0 bg-transparent text-muted-foreground"
      variant="outline"
    >
      <Progress
        aria-label={t("a11y.subtaskProgress")}
        className="h-[8px] w-full rounded-full bg-muted-foreground/20 [&_[data-slot=progress-indicator]]:bg-[var(--task-progress-color)]"
        style={
          { "--task-progress-color": progressColor } as CSSProperties
        }
        value={progressValue}
      />
      <span className="text-[13px]">{completedCount}/{totalCount}</span>
    </Badge>
  );
}
