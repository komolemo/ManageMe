import * as React from "react";
import { Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
      type={type}
      variant={variant}
      {...props}
    >
      <Tag className="size-[16px]" />
      <span className="truncate">{normalizedTag}</span>
    </Button>
  );
}
