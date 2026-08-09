import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

import {
  AppHeaderActions,
  AppHeaderLeft,
  AppHeaderSearch,
  type AppHeaderProps,
} from "@/layout/AppHeader/AppHeader";

const appWindow = getCurrentWindow();

export function TitleBar(props: AppHeaderProps) {
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
      <AppHeaderLeft onNavigate={props.onNavigate} />
      <AppHeaderSearch
        onOpenSearchDocument={props.onOpenSearchDocument}
        onOpenSearchTask={props.onOpenSearchTask}
        onSearch={props.onSearch}
        showSearchSuggestions={props.showSearchSuggestions}
        workspaceId={props.workspaceId}
      />
      <div className="z-40 flex h-full min-w-0 items-center justify-end gap-2">
        <AppHeaderActions
          onNavigate={props.onNavigate}
          onOpenInNewTab={props.onOpenInNewTab}
        />
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
      </div>
    </header>
  );
}
