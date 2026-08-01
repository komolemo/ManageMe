import {
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/utils";

type ResizeHandleProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onResize"
> & {
  onResize: (deltaX: number) => void;
  resizeStep?: number;
};

export function ResizeHandle({
  className,
  onResize,
  resizeStep = 16,
  ...props
}: ResizeHandleProps) {
  const previousPointerXRef = useRef<number | null>(null);

  const startResizing = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    previousPointerXRef.current = event.clientX;
  };

  const resize = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const previousPointerX = previousPointerXRef.current;
    previousPointerXRef.current = event.clientX;

    if (previousPointerX !== null) {
      onResize(event.clientX - previousPointerX);
    }
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    onResize(event.key === "ArrowLeft" ? -resizeStep : resizeStep);
  };

  return (
    <div
      aria-orientation="vertical"
      className={cn(
        "h-full w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-toggle-background",
        className,
      )}
      onKeyDown={resizeWithKeyboard}
      onLostPointerCapture={() => {
        previousPointerXRef.current = null;
      }}
      onPointerDown={startResizing}
      onPointerMove={resize}
      role="separator"
      tabIndex={0}
      {...props}
    />
  );
}
