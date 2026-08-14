import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type XButtonProps = Omit<
  ComponentProps<typeof Button>,
  "aria-label" | "children" | "variant"
> & {
  label: string;
};

export function XButton({
  label,
  size = "icon-xs",
  type = "button",
  ...props
}: XButtonProps) {
  return (
    <Button
      aria-label={label}
      size={size}
      type={type}
      variant="ghost"
      {...props}
    >
      <X aria-hidden className="size-4" />
    </Button>
  );
}
