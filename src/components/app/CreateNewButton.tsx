import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type CreateNewButtonProps = React.ComponentProps<typeof Button>;

export function CreateNewButton({
  children,
  className,
  size = "action",
  type = "button",
  ...props
}: CreateNewButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      className={className}
      size={size}
      type={type}
      variant="accent"
      {...props}
    >
      <Plus className="size-6" />
      <span className="font-[600]">{children ?? t("common.new")}</span>
    </Button>
  );
}
