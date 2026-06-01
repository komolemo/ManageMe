import { memo } from "react";
import { CornerDownRight } from "lucide-react";

export const SubjectCell = memo(function SubjectCell({
  depth,
  isFinished,
  subject,
}: {
  depth: number;
  isFinished: boolean;
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
      <span className={subjectClassName} title={subject}>
        {subject}
      </span>
    </div>
  );
});
