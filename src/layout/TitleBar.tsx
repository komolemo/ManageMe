import type { ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

type TitleBarProps = {
  children: ReactNode;
};

const appWindow = getCurrentWindow();

export function TitleBar({ children }: TitleBarProps) {
  return (
    <header
      className="
        grid h-[40px] w-full shrink-0
        grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2
        bg-header text-foreground -shadow-[0_6px_6px_-8px_var(--shadow)]
        md:grid-cols-[minmax(0,1fr)_minmax(0,min(400px,calc(100%-464px)))_minmax(0,1fr)]
      "
      data-tauri-drag-region
    >
      {children}
    </header>
  );
}

export function TitleBarControls() {
  return (
    <>
      <button
        aria-label="Minimize"
        className="grid w-12 h-10 place-items-center bg-transparent hover:bg-muted"
        onClick={() => void appWindow.minimize()}
        type="button"
      >
        <Minus className="size-4" />
      </button>
      <button
        aria-label="Maximize or restore"
        className="grid w-12 h-10 place-items-center bg-transparent hover:bg-muted"
        onClick={() => void appWindow.toggleMaximize()}
        type="button"
      >
        <Square className="size-3.5" />
      </button>
      <button
        aria-label="Close"
        className="grid w-12 h-10 place-items-center bg-transparent hover:bg-destructive hover:text-white"
        onClick={() => void appWindow.close()}
        type="button"
      >
        <X className="size-4" />
      </button>
    </>
  );
}
