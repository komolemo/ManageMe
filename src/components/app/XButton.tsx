import { X } from "lucide-react";
import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

type XButtonProps = Omit<
  ComponentProps<typeof Button>,
  "aria-label" | "children" | "variant"
> & {
  label: string;
};

export function XButton({
  label,
  size = "icon-xs",
  type = "button",
  ...props
}: XButtonProps) {
  return (
    <Button
      aria-label={label}
      size={size}
      type={type}
      variant="ghost"
      {...props}
    >
      <X aria-hidden className="size-4" />
    </Button>
  );
}

export function ModalXButton({
  className,
  size = "icon-sm",
  type = "button",
  ...props
}: XButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      aria-label={t("common.close")}
      className={className ?? "size-8 rounded-full"}
      size={size}
      type={type}
      variant="ghost"
      {...props}
    >
      <XIcon aria-hidden size={18} weight="bold" />
    </Button>
  );
}
