import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconTextItemProps = {
  icon: ReactNode;
  text: ReactNode;
};

export type IconTextColorScheme =
  | "highlight"
  | "primary"
  | "success"
  | "destructive"
  | "accent";

const iconColorSchemeClasses: Record<IconTextColorScheme, string> = {
  highlight: "from-highlight-1 to-highlight-2",
  primary: "from-primary to-primary/70 text-primary-foreground",
  success: "from-success to-success/70 text-success-foreground",
  destructive: "from-destructive to-destructive/70 text-white",
  accent: "from-accent to-accent-2 text-accent-foreground",
};

export function PlainIconTextItem({ icon, text }: IconTextItemProps) {
  return (
    <span className="flex items-center gap-[8px] text-base font-medium">
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      <span>{text}</span>
    </span>
  );
}

export function HighlightedIconTextItem({
  colorScheme = "highlight",
  icon,
  text,
}: IconTextItemProps & { colorScheme?: IconTextColorScheme }) {
  return (
    <span className="flex items-center gap-[8px] text-base font-medium">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-sm bg-gradient-to-b",
          iconColorSchemeClasses[colorScheme],
        )}
      >
        {icon}
      </span>
      <span>{text}</span>
    </span>
  );
}
