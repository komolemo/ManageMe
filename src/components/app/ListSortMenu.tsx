import { ArrowDown, ArrowDownUp, ArrowUp, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export type SortCriterion = "name" | "updated" | "created";
export type SortDirection = 0 | 1 | 2;

type ListSortMenuProps = {
  criterion: SortCriterion;
  direction: SortDirection;
  iconOnly?: boolean;
  starred: boolean;
  onChange: (
    criterion: SortCriterion,
    direction: SortDirection,
    starred: boolean,
  ) => void;
};

export function ListSortMenu({
  criterion,
  direction,
  iconOnly = false,
  starred,
  onChange,
}: ListSortMenuProps) {
  const { t } = useTranslation();
  const options: Array<{ criterion: SortCriterion; label: string }> = [
    { criterion: "name", label: t("sort.name") },
    { criterion: "updated", label: t("sort.lastUpdated") },
    { criterion: "created", label: t("sort.creationDate") },
  ];
  const selectedLabel = starred
    ? t("sort.starred")
    : options.find((option) => option.criterion === criterion)?.label;
  const SortArrow = direction === 2 ? ArrowDown : ArrowUp;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={iconOnly ? t("sort.sort") : undefined}
          className={
            iconOnly
              ? "size-7 rounded-sm border-0"
              : "w-[220px] justify-between rounded-md"
          }
          size={iconOnly ? "icon-sm" : "default"}
          type="button"
          variant={iconOnly ? "ghost" : "outline"}
        >
          {iconOnly ? (
            <ListFilter aria-hidden className="size-4" />
          ) : (
            <>
              <span>{selectedLabel}</span>
              {starred ? (
                <ArrowDownUp className="size-4 text-muted-foreground" />
              ) : (
                <SortArrow aria-hidden className="size-4" />
              )}
            </>
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
                  aria-label={direction === 2 ? t("sort.descending") : t("sort.ascending")}
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
          {t("sort.starred")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
