import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortCriterion = "name" | "updated" | "created";
export type SortDirection = 0 | 1 | 2;

type ListSortMenuProps = {
  criterion: SortCriterion;
  direction: SortDirection;
  starred: boolean;
  onChange: (
    criterion: SortCriterion,
    direction: SortDirection,
    starred: boolean,
  ) => void;
};

const options: Array<{ criterion: SortCriterion; label: string }> = [
  { criterion: "name", label: "Name" },
  { criterion: "updated", label: "Last Updated" },
  { criterion: "created", label: "Creation Date" },
];

export function ListSortMenu({
  criterion,
  direction,
  starred,
  onChange,
}: ListSortMenuProps) {
  const selectedLabel = starred
    ? "Starred"
    : options.find((option) => option.criterion === criterion)?.label;
  const SortArrow = direction === 2 ? ArrowDown : ArrowUp;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-[220px] justify-between rounded-md" type="button" variant="outline">
          <span>{selectedLabel}</span>
          {starred ? (
            <ArrowDownUp className="size-4 text-muted-foreground" />
          ) : (
            <SortArrow aria-hidden className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px] rounded-md">
        {options.map((option) => {
          const isSelected = !starred && criterion === option.criterion;
          return (
            <DropdownMenuItem
              className="flex cursor-pointer justify-between gap-4 rounded-sm"
              key={option.criterion}
              onSelect={() =>
                onChange(option.criterion, isSelected && direction === 1 ? 2 : 1, false)
              }
            >
              <span>{option.label}</span>
              {isSelected ? (
                <SortArrow
                  aria-label={direction === 2 ? "Descending" : "Ascending"}
                  className="size-4"
                />
              ) : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          className="cursor-pointer rounded-sm"
          onSelect={() => onChange(criterion, 0, true)}
        >
          Starred
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
