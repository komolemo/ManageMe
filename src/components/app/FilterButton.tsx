import { ArrowUpDown } from "lucide-react";
import type { MouseEventHandler } from "react";

import { Button } from "@/components/ui/button";

type FilterButtonProps = {
  isActive: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function FilterButton({
  isActive,
  label,
  onClick,
}: FilterButtonProps) {
  return (
    <Button
      aria-label={label}
      aria-pressed={isActive}
      className="size-7 rounded-sm border-0"
      onClick={onClick}
      size="icon-sm"
      type="button"
      variant={isActive ? "secondary" : "ghost"}
    >
      <ArrowUpDown aria-hidden className="size-4" />
    </Button>
  );
}
