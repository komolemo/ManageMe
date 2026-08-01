import { useState, type ReactNode } from "react";
import { ListFilter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DetailSidebarToolbarProps = {
  addLabel?: string;
  filterLabel?: string;
  leadingAction?: ReactNode;
  onAdd?: () => void;
  onFilterChange?: (query: string) => void;
};

export function DetailSidebarToolbar({
  addLabel,
  filterLabel,
  leadingAction,
  onAdd,
  onFilterChange,
}: DetailSidebarToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="grid gap-1.5">
      <div className="flex h-8 items-center justify-end gap-1">
        {leadingAction}
        {filterLabel && onFilterChange ? (
          <Button
            aria-label={filterLabel}
            aria-pressed={isFilterOpen}
            className="size-7 rounded-sm border-0"
            onClick={() => {
              setIsFilterOpen((isOpen) => {
                if (isOpen) onFilterChange("");
                return !isOpen;
              });
            }}
            size="icon-sm"
            type="button"
            variant={isFilterOpen ? "secondary" : "ghost"}
          >
            <ListFilter aria-hidden className="size-4" />
          </Button>
        ) : null}
        {addLabel && onAdd ? (
          <Button
            aria-label={addLabel}
            className="size-7 rounded-sm border-0"
            onClick={onAdd}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Plus aria-hidden className="size-4" />
          </Button>
        ) : null}
      </div>
      {isFilterOpen && filterLabel && onFilterChange ? (
        <Input
          aria-label={filterLabel}
          autoFocus
          className="h-7 rounded-md"
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder={`${filterLabel}...`}
        />
      ) : null}
    </div>
  );
}
