import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MenuButtonAction = {
  label: string;
  onSelect?: () => void;
};

type MenuButtonProps = {
  actions: MenuButtonAction[];
  ariaLabel: string;
};

// grid size-6 cursor-pointer shrink-0 justify-center place-items-center rounded-full border-0 bg-transparent
// text-transparent htext-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-accent-foreground
// data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground

export function MenuButton({ actions, ariaLabel }: MenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className="rounded-full"
          type="button"
          variant="ghost"
        >
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="grid min-w-[120px] rounded-md bg-popover p-[4px] text-popover-foreground"
      >
        {actions.map((action) => (
          <DropdownMenuItem
            className="cursor-pointer rounded-sm border-0 px-[8px] py-[6px] text-xs"
            key={action.label}
            onSelect={action.onSelect}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
