import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import type { MouseEvent, ReactElement } from "react";

type SidebarGroupProps = {
  title: string;
  items: string[];
  icon: ReactElement;
  isOpen: boolean;
  menuLabel: string;
  onMenuNavigate: () => void;
  onMenuOpenInNewTab: () => void;
  onItemClick: (item: string) => void;
  onItemOpenInNewTab: (item: string) => void;
  onToggle: () => void;
};

export function SidebarGroup({
  title,
  items,
  icon,
  isOpen,
  menuLabel,
  onMenuNavigate,
  onMenuOpenInNewTab,
  onItemClick,
  onItemOpenInNewTab,
  onToggle,
}: SidebarGroupProps) {
  const handleMouseWheelClick = (
    event: MouseEvent<HTMLButtonElement>,
    callback: () => void
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    callback();
  };

  return (
    <section className="grid px-2 py-1">
      <div
        className="flex h-9 cursor-pointer px-2 gap-2 items-center rounded-lg border-0 bg-transparent text-left text-[14px] font-semibold uppercase text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
        onClick={onToggle}
        aria-expanded={isOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isOpen ? <ChevronDown className="size-6" /> : <ChevronRight className="size-6" />}
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </div>
      {isOpen && (
        <div className="grid">
          {items.map((item) => (
            <button
              className="flex h-9 w-full min-w-0 cursor-pointer px-2 py-2 items-center gap-2 border-0 bg-transparent rounded-lg text-left text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
              key={item}
              onClick={() => onItemClick(item)}
              onAuxClick={(event) =>
                handleMouseWheelClick(event, () => onItemOpenInNewTab(item))
              }
              type="button"
            >
              {icon}
              <span className="min-w-0 flex-1 truncate">{item}</span>
            </button>
          ))}
          <button
            className="flex h-9 cursor-pointer px-2 py-2 gap-2 text-[12px] items-center rounded-lg border-0 bg-transparent text-left text-[12px] font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
            onClick={onMenuNavigate}
            onAuxClick={(event) =>
              handleMouseWheelClick(event, onMenuOpenInNewTab)
            }
            type="button"
          >
            <ArrowRight className="size-4" />
            <span>{menuLabel}</span>
          </button>
        </div>
      )}
    </section>
  );
}
