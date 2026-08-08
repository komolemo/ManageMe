import { type DragEvent, type ReactNode } from "react";
import { BoardColumnHeader } from "./BoardColumnHeader";

type BoardColumnProps = {
  children: ReactNode;
  isColumnOverflowing: boolean;
  isDragOverBucket: boolean;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onOpenCreateTaskCard: () => void;
  onScrollElementChange: (element: HTMLDivElement | null) => void;
  status: string;
};

export function BoardColumn({
  children,
  isColumnOverflowing,
  isDragOverBucket,
  onDragOver,
  onDrop,
  onOpenCreateTaskCard,
  onScrollElementChange,
  status,
}: BoardColumnProps) {
  return (
    <section
      className={`flex h-full min-h-0 shrink-0 flex-col gap-[8px] border border-transparent bg-transparent ${
        isDragOverBucket ? "border-primary bg-accent/30" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ width: "320px" }}
    >
      <BoardColumnHeader
        onOpenCreateTaskCard={onOpenCreateTaskCard}
        status={status}
      />

      <div
        className={`hover-scrollbar-y flex min-h-0 flex-1 flex-col overflow-y-auto ${
          isColumnOverflowing ? "pr-[8px]" : "pr-[16px]"
        }`}
        ref={onScrollElementChange}
      >
        {children}
      </div>
    </section>
  );
}
