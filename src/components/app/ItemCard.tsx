import { useState } from "react";
import type { MouseEvent } from "react";
import { MoreHorizontal, Star, type LucideIcon } from "lucide-react";
import { EditableName1 } from "@/components/app/EditableName";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ItemAction = {
  text: string;
  onClick: () => void;
};

type ItemProps = {
  Icon: LucideIcon;
  itemName: string;
  itemDescription: string;
  isStarred?: boolean;
  actions: ItemAction[];
  onSaveEditing: (title: string) => void;
  onCancelEditing?: () => void;
  onOpenInNewTab?: () => void;
  onToggleStar?: () => void;
  onSelect: () => void;
};

export function Item({
  Icon,
  itemName,
  itemDescription,
  isStarred = false,
  actions,
  onSaveEditing,
  onCancelEditing,
  onOpenInNewTab,
  onToggleStar,
  onSelect,
}: ItemProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const selectItem = () => {
    onSelect();
  };

  const openItemInNewTab = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 1 || !onOpenInNewTab) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab();
  };

  return (
    <Card
      className="
        py-[8px] border-t ring-0 pr-[16px] cursor-pointer
        transition-colors hover:bg-muted/40 focus-visible:outline-none
        focus-visible:ring-[3px] focus-visible:ring-ring/50
      "
      onClick={selectItem}
      onAuxClick={openItemInNewTab}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" || event.key === " "
        ) {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader>
        <div className="flex min-w-0 items-start gap-[16px]">
          <span className="mt-[6px] flex w-[32px] h-[32px] shrink-0 items-center justify-center">
            <Icon className="size-8 text-current" />
          </span>
          <div className="grid min-w-0 flex-1 gap-[4px]">
            <div className="flex min-w-0 items-center gap-[8px]">
              <EditableName1
                name={itemName}
                onCancelEditing={onCancelEditing}
                onSaveEditing={onSaveEditing}
              />
              {onToggleStar ? (
                <Button
                  aria-label={isStarred ? `Unstar ${itemName}` : `Star ${itemName}`}
                  aria-pressed={isStarred}
                  className="size-[32px] shrink-0 rounded-full border-0 bg-transparent hover:bg-muted/70"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleStar();
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Star className={isStarred ? "size-5 fill-current text-amber-500" : "size-5"} />
                </Button>
              ) : null}
              <DropdownMenu
                open={isActionsMenuOpen}
                onOpenChange={setIsActionsMenuOpen}
              >
                <div
                  className="shrink-0"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={`${itemName} actions`}
                      className="w-[32px] h-[32px] border-0 rounded-full bg-transparent hover:bg-muted/70 data-[state=open]:bg-muted/70"
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <MoreHorizontal className="size-6 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                  align="end"
                  className="
                    grid rounded-md w-[calc(100vw-16px)] max-w-[120px]
                    border-0 bg-popover text-popover-foreground
                    shadow-lg shadow-foreground/10 dark:bg-popover-2
                    dark:text-popover-foreground dark:shadow-black/40 sm:w-[200px]
                  "
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {actions.map((action) => (
                    <DropdownMenuItem
                      className="
                        grid min-w-0 border-0 bg-popover px-[12px] py-[10px]
                        text-left text-xs font-medium text-popover-foreground
                        hover:bg-muted focus-visible:bg-muted
                        dark:bg-popover-2 dark:hover:bg-accent-2 dark:focus-visible:bg-accent
                      "
                      key={action.text}
                      onSelect={() => {
                        action.onClick();
                        setIsActionsMenuOpen(false);
                      }}
                    >
                      {action.text}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="text-[15px]">
              {itemDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
