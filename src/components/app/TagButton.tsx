import * as React from "react";
import { Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useTagStore } from "@/features/tag/tagStore";
import { tagColorById } from "@/pages/tagsData";

type TagButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick"
> & {
  tag: string;
  onSearchTag: (tag: string) => void;
};

export function TagButton({
  className,
  onSearchTag,
  size = "sm",
  tag,
  type = "button",
  variant = "secondary",
  ...props
}: TagButtonProps) {
  const { t } = useTranslation();
  const normalizedTag = tag.trim();
  const tags = useTagStore((state) => state.tags);
  const loadTags = useTagStore((state) => state.loadTags);
  const tagRecord = tags.find(
    (item) => item.name.trim().toLowerCase() === normalizedTag.toLowerCase(),
  );
  const tagColor = tagRecord?.colorId == null
    ? undefined
    : tagColorById.get(tagRecord.colorId);

  useEffect(() => {
    void loadTags().catch(() => undefined);
  }, [loadTags]);

  return (
    <Button
      aria-label={t("tags.searchFor", { tagName: normalizedTag })}
      className={cn(
        "h-5 max-w-full gap-1 overflow-hidden rounded-full px-[8px] py-[2px] gap-[4px] text-xs",
        className
      )}
      disabled={!normalizedTag || props.disabled}
      onClick={() => onSearchTag(normalizedTag)}
      size={size}
      {...props}
      style={tagColor ? {
        backgroundColor: tagColor.backgroundValue,
        borderColor: tagColor.value,
      } : props.style}
      type={type}
      variant={variant}
    >
      <Tag className="size-[16px]" />
      <span className="truncate">{normalizedTag}</span>
    </Button>
  );
}
