import type { ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

type TitleBarControlButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "close";
};

const appWindow = getCurrentWindow();

export function TitleBar() {
  return (
    <header
      className="
        absolute inset-x-0 top-0 grid h-[40px] w-full shrink-0
        grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2
        text-foreground
        md:grid-cols-[minmax(0,1fr)_minmax(0,min(400px,calc(100%-464px)))_minmax(0,1fr)]
      "
      data-tauri-drag-region
    >
      <TitleBarController/>
    </header>
  );
}

function TitleBarController() {
  return (
    <div className="absolute top-0 right-0 z-40 flex h-full items-center gap-2">
      <TitleBarControlButton
        ariaLabel="Minimize"
        onClick={() => void appWindow.minimize()}
      >
        <Minus className="size-4" />
      </TitleBarControlButton>
      <TitleBarControlButton
        ariaLabel="Maximize or restore"
        onClick={() => void appWindow.toggleMaximize()}
      >
        <Square className="size-3.5" />
      </TitleBarControlButton>
      <TitleBarControlButton
        ariaLabel="Close"
        onClick={() => void appWindow.close()}
        variant="close"
      >
        <X className="size-4" />
      </TitleBarControlButton>
    </div>
  )
}

function TitleBarControlButton({
  ariaLabel,
  children,
  onClick,
  variant = "default",
}: TitleBarControlButtonProps) {
  const hoverClassName =
    variant === "close"
      ? "hover:bg-destructive hover:text-white"
      : "hover:bg-muted";

  return (
    <button
      aria-label={ariaLabel}
      className={`grid h-10 w-12 place-items-center bg-transparent ${hoverClassName}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
