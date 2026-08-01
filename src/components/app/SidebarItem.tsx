import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  children: ReactNode;
  selected?: boolean;
};

export function SidebarItem({
  children,
  selected = false,
}: SidebarItemProps) {
  return (
    <div
      aria-current={selected ? "page" : undefined}
      className={cn(
        `
          flex max-w-[calc(100%)] items-center justify-between gap-[4px]
          overflow-hidden rounded-lg pr-[4px]
          hover:bg-accent-2 hover:text-sidebar-accent-foreground
        `,
        selected ? "bg-accent-2 text-sidebar-accent-foreground" : "",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "h-4 w-0.5 ml-1 shrink-0 rounded-full",
          selected ? "bg-primary" : "bg-transparent",
        )}
      />
      {children}
    </div>
  );
}
