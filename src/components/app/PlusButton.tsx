import { Plus } from "lucide-react";
import type { MouseEventHandler } from "react";

import { Button } from "@/components/ui/button";

type PlusButtonProps = {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function PlusButton({ label, onClick }: PlusButtonProps) {
  return (
    <Button
      aria-label={label}
      className=""
      onClick={onClick}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      <Plus aria-hidden className="size-4" />
    </Button>
  );
}
