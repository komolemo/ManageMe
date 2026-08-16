import manageMeLogo from "@/img/ManageMe_logo_2.png";
import type { PageKey } from "@/pages/pageTypes";

export type AppHeaderLogoProps = {
  onNavigate: (page: PageKey) => void;
  showText?: boolean;
};

export function AppHeaderLogo({
  onNavigate,
  showText = true,
}: AppHeaderLogoProps) {
  // Previous background: bg-background inherited from AppLayout.
  return (
    <div
      className="flex h-9 min-w-0 shrink-0 items-center bg-header pl-4"
      data-tauri-drag-region
    >
      <button
        aria-label="ManageMe"
        className="flex cursor-pointer items-center gap-2 truncate border-0 bg-transparent p-0 text-xl font-semibold text-foreground"
        onClick={() => onNavigate("top")}
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-6 shrink-0 object-contain"
          src={manageMeLogo}
        />
        {showText ? <span>ManageMe</span> : null}
      </button>
    </div>
  );
}
