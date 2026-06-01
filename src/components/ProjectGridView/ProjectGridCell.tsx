import { memo, type MouseEvent, type ReactNode } from "react";

type ProjectGridCellProps = {
  className?: string;
  children: ReactNode;
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

export const ProjectGridCell = memo(function ProjectGridCell({
  className = "",
  children,
  onDoubleClick,
}: ProjectGridCellProps) {
  return (
    <div
      className={`flex min-w-0 items-center whitespace-nowrap px-[8px] mx-[2px] py-[4px] ${className}`}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
});
