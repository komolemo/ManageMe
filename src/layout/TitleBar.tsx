import { useEffect, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { SettingsButton } from "@/layout/AppHeader/AppHeaderSettingsButton";
import type { PageKey } from "@/pages/pageTypes";

type TitleBarProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

type TitleBarControlButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "close";
};

const appWindow = getCurrentWindow();

export function TitleBar({ onNavigate, onOpenInNewTab }: TitleBarProps) {
  useEffect(() => {
    const startWindowDragging = (event: MouseEvent) => {
      if (event.button !== 0 || event.clientY >= 40) {
        return;
      }

      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(
          "button, a, input, select, textarea, [role='button'], [data-no-window-drag]",
        )
      ) {
        return;
      }

      void appWindow.startDragging();
    };

    document.addEventListener("mousedown", startWindowDragging);
    return () => document.removeEventListener("mousedown", startWindowDragging);
  }, []);

  return (
    <header
      className="
        pointer-events-none absolute inset-x-0 top-0 grid h-10 w-full shrink-0
        grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2
        text-foreground
        md:grid-cols-[minmax(0,1fr)_minmax(0,min(400px,calc(100%-464px)))_minmax(0,1fr)]
      "
      data-tauri-drag-region
    >
      <div className="pointer-events-auto absolute top-0 right-0 z-40 flex h-full items-start gap-4">
        <SettingsButton
          onNavigate={onNavigate}
          onOpenInNewTab={onOpenInNewTab}
        />
        <TitleBarController />
      </div>
    </header>
  );
}

function TitleBarController() {
  return (
    <div className="flex h-full items-start gap-2">
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
      className={`grid h-8 w-12 place-items-center bg-transparent ${hoverClassName}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
