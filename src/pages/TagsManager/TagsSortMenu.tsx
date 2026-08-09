import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTagManager, type TagSortKey } from "./useTagManager";

export function TagsSortMenu() {
  const { t } = useTranslation();
  const { changeSort, sortKey } = useTagManager();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-[32px] gap-[4px] rounded-md border border-muted bg-transparent py-1 pl-[8px] pr-[16px] text-foreground hover:bg-muted/50"
          size="sm"
          type="button"
          variant="outline"
        >
          <ArrowUpDown className="size-4" />
          <span className="font-[600]">{t("sort.sort")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuRadioGroup
          onValueChange={(value) => changeSort(value as TagSortKey)}
          value={sortKey}
        >
          <DropdownMenuRadioItem value="tag">
            {t("sort.name")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="color">
            {t("sort.color")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="lastUsed">
            {t("sort.lastUsed")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
