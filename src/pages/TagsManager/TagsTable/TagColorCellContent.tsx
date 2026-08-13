import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tagColorById, tagColors } from "@/features/tag/tagColors";
import type { Tag } from "@/features/tag/types";
import { useTagManager } from "../useTagManager";

export function TagColorCellContent({ tag }: { tag: Tag }) {
  const { t } = useTranslation();
  const { changeTagColor, updatingTagId } = useTagManager();
  const tagColor =
    tag.colorId === null ? undefined : tagColorById.get(tag.colorId);

  return (
    <span
      className="flex h-8 min-w-0 justify-center"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t("tags.changeColor")}
            className="h-full px-2 min-w-0 justify-start gap-2 border-0 bg-transparent text-muted-foreground hover:bg-muted/50"
            disabled={updatingTagId === tag.tagId}
            type="button"
            variant="ghost"
          >
            <span
              aria-hidden
              className="size-6 shrink-0 rounded-full border-[2px]"
              style={{
                backgroundColor: tagColor?.backgroundValue,
                backgroundClip: "padding-box",
                borderColor: tagColor?.value,
              }}
            />
            <span className="min-w-12 truncate">
              {tagColor
                ? t(`colors.${tagColor.name}`)
                : tag.colorId ?? "-"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              void changeTagColor(tag, Number(value))
            }
            value={tag.colorId?.toString() ?? ""}
          >
            {tagColors.map((color) => (
              <DropdownMenuRadioItem
                key={color.id}
                value={color.id.toString()}
              >
                <span
                  aria-hidden
                  className="size-5 rounded-full border"
                  style={{
                    backgroundColor: color.backgroundValue,
                    borderColor: color.value,
                  }}
                />
                <span>{t(`colors.${color.name}`)}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
