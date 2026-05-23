import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateNewButtonProps = React.ComponentProps<typeof Button>;

export function CreateNewButton({
  children = "New",
  className,
  size = "sm",
  type = "button",
  ...props
}: CreateNewButtonProps) {
  return (
    <Button
      className={cn(
        "h-[32px] pl-[8px] pr-[16px] py-[4px] rounded-md bg-[#238636] hover:bg-[#2ea043] text-[#fff]",
        className
      )}
      size={size}
      type={type}
      {...props}
    >
      <Plus className="size-4" />
      <span className="font-[600]">{children}</span>
    </Button>
  );
}
