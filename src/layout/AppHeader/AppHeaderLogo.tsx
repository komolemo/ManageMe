import manageMeLogo from "@/img/ManageMe_logo_2.png";
import type { AppHeaderProps } from "@/layout/AppHeader/AppHeader";

export type AppHeaderLogoProps = Pick<AppHeaderProps, "onNavigate">;

export function AppHeaderLogo({ onNavigate }: AppHeaderLogoProps) {
  return (
    <div
      className="flex min-w-0 items-center pl-2"
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
        <span className="hidden md:inline">ManageMe</span>
      </button>
    </div>
  );
}
