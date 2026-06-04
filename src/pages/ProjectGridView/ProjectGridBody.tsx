import type { ReactNode, RefObject, UIEvent } from "react";

type ProjectGridBodyProps = {
  children: ReactNode;
  gridMinWidth: number;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  tableBodyScrollRef: RefObject<HTMLDivElement | null>;
};

export function ProjectGridBody({
  children,
  gridMinWidth,
  onScroll,
  tableBodyScrollRef,
}: ProjectGridBodyProps) {
  return (
    <div
      className="min-h-0 flex-1 basis-0 overflow-x-auto overflow-y-scroll [scrollbar-gutter:stable]"
      onScroll={onScroll}
      ref={tableBodyScrollRef}
    >
      <div
        className="grid"
        style={{ minWidth: `${gridMinWidth}px`, width: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}
