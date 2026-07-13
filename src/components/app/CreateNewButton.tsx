import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type CreateNewButtonProps = React.ComponentProps<typeof Button>;

export function CreateNewButton({
  children,
  className,
  size = "sm",
  type = "button",
  ...props
}: CreateNewButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      className={cn(
        "h-[32px] pl-[8px] pr-[16px] py-[4px] rounded-md bg-create-new-button hover:bg-create-new-button-hover text-[#fff]",
        className
      )}
      size={size}
      type={type}
      {...props}
    >
      <Plus className="size-6" />
      <span className="font-[600]">{children ?? t("common.new")}</span>
    </Button>
  );
}
