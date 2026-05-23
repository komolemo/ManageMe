import { useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { EditableName } from "@/components/app/EditableName";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export type ItemAction = {
  text: string;
  onClick: () => void;
};

type ItemProps = {
  Icon: LucideIcon;
  itemName: string;
  itemDescription: string;
  actions: ItemAction[];
  isEditing: boolean;
  isNavigationDisabled: boolean;
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
  onStartEditing: () => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onSelect: () => void;
};

export function Item({
  Icon,
  itemName,
  itemDescription,
  actions,
  isEditing,
  isNavigationDisabled,
  draftTitle,
  onDraftTitleChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onSelect,
}: ItemProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const selectItem = () => {
    if (!isNavigationDisabled) {
      onSelect();
    }
  };

  return (
    <Card
      className="
        py-[8px] border-t ring-0 pr-[16px] cursor-pointer
        transition-colors hover:bg-muted/40 focus-visible:outline-none
        focus-visible:ring-[3px] focus-visible:ring-ring/50
      "
      onClick={selectItem}
      onKeyDown={(event) => {
        if (
          !isNavigationDisabled &&
          (event.key === "Enter" || event.key === " ")
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
            <Icon className="size-[32px] text-current" />
          </span>
          <div className="grid min-w-0 flex-1 gap-[4px]">
            <div className="flex min-w-0 items-center gap-[8px]">
              <EditableName
                draftName={draftTitle}
                isEditing={isEditing}
                name={itemName}
                onCancelEditing={onCancelEditing}
                onDraftNameChange={onDraftTitleChange}
                onSaveEditing={onSaveEditing}
                onStartEditing={onStartEditing}
              />
              <div
                className="relative shrink-0"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsActionsMenuOpen(false);
                  }
                }}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Button
                  aria-expanded={isActionsMenuOpen}
                  aria-haspopup="menu"
                  aria-label={`${itemName} actions`}
                  className="w-[32px] h-[32px] border-0 rounded-full bg-transparent hover:bg-muted/70 aria-expanded:bg-muted/70"
                  onClick={() => setIsActionsMenuOpen((isOpen) => !isOpen)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <MoreHorizontal className="size-4 text-foreground" />
                </Button>
                {isActionsMenuOpen && (
                  <div
                    className="
                      absolute right-0 top-[calc(100%+4px)] z-50 grid rounded-md
                      w-[calc(100vw-16px)] max-w-[240px]
                      overflow-hidden border-0 bg-popover text-popover-foreground
                      shadow-lg shadow-foreground/10 dark:bg-popover-2 dark:text-popover-foreground
                      dark:shadow-black/40 sm:w-[200px]
                    "
                    role="menu"
                  >
                    {actions.map((action) => (
                      <button
                        className="
                          grid min-w-0 border-0 bg-popover px-[12px] py-[10px]
                          text-left text-xs font-medium text-popover-foreground
                          hover:bg-muted focus-visible:bg-muted
                          dark:bg-popover-2 dark:hover:bg-accent-2 dark:focus-visible:bg-accent
                        "
                        key={action.text}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          action.onClick();
                          setIsActionsMenuOpen(false);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
