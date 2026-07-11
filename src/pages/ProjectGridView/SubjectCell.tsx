import { memo, type MouseEvent } from "react";
import { CornerDownRight } from "lucide-react";

export const SubjectCell = memo(function SubjectCell({
  depth,
  isFinished,
  onOpenTaskDetails,
  onOpenTaskInNewTab,
  subject,
}: {
  depth: number;
  isFinished: boolean;
  onOpenTaskDetails: () => void;
  onOpenTaskInNewTab: () => void;
  subject: string;
}) {
  const indicatorIndentClassName = depth > 1 ? "ml-[24px]" : "";
  const subjectClassName = isFinished
    ? "block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-muted-foreground line-through"
    : "block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium";

  return (
    <div className="flex w-full min-w-0 overflow-hidden items-center gap-[4px]">
      {depth > 0 ? (
        <CornerDownRight
          aria-hidden
          className={`size-4 shrink-0 text-muted-foreground ${indicatorIndentClassName}`}
        />
      ) : null}
      <button
        className={`${subjectClassName} cursor-pointer border-0 bg-transparent p-0 text-left underline-offset-4 hover:underline focus-visible:ring-[2px] focus-visible:ring-ring`}
        onClick={onOpenTaskDetails}
        onAuxClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (event.button !== 1) {
            return;
          }

          event.preventDefault();
        }}
        onMouseDown={(event) => {
          if (event.button !== 1) {
            return;
          }

          event.preventDefault();
          onOpenTaskInNewTab();
        }}
        title={subject}
        type="button"
      >
        {subject}
      </button>
    </div>
  );
});
