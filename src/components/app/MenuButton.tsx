import { Ellipsis } from "lucide-react";
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

export function MenuButton({ actions, ariaLabel }: MenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={ariaLabel}
          className="
            grid size-6 cursor-pointer shrink-0 justify-center place-items-center rounded-full border-0 bg-transparent
            text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-accent-foreground
            data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground
          "
          type="button"
        >
          <Ellipsis className="size-4" />
        </button>
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
