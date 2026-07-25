import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import type { ComponentProps } from "react";

import { AppHeader } from "@/layout/AppHeader";

type TitleBarProps = ComponentProps<typeof AppHeader>;

const appWindow = getCurrentWindow();

export function TitleBar(props: TitleBarProps) {
  return (
    <div
      className="flex h-[40px] w-full shrink-0 bg-header text-foreground"
      data-tauri-drag-region
    >
      <AppHeader {...props} />
      <div className="z-40 flex h-full shrink-0 items-stretch">
        <button
          aria-label="Minimize"
          className="grid w-12 place-items-center bg-transparent hover:bg-muted"
          onClick={() => void appWindow.minimize()}
          type="button"
        >
          <Minus className="size-4" />
        </button>
        <button
          aria-label="Maximize or restore"
          className="grid w-12 place-items-center bg-transparent hover:bg-muted"
          onClick={() => void appWindow.toggleMaximize()}
          type="button"
        >
          <Square className="size-3.5" />
        </button>
        <button
          aria-label="Close"
          className="grid w-12 place-items-center bg-transparent hover:bg-destructive hover:text-white"
          onClick={() => void appWindow.close()}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
