import { memo, type MouseEvent, type ReactNode } from "react";

type ProjectGridCellProps = {
  children: ReactNode;
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

export const ProjectGridCell = memo(function ProjectGridCell({
  children,
  onDoubleClick,
}: ProjectGridCellProps) {
  return (
    <div
      className="flex min-w-0 items-center whitespace-nowrap px-[8px] mx-[2px] py-[4px]"
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
});
