import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";

type DetailSidebarHeaderProps = {
  name: string;
};

export function DetailSidebarHeader({ name }: DetailSidebarHeaderProps) {
  const detailSidebar = useDetailSidebar();

  if (!detailSidebar) {
    return null;
  }

  return (
    <header className="shrink-0">
      <div className="flex h-8 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium" title={name}>
          {name}
        </span>
        <DetailSidebarHeaderClose onClose={detailSidebar.onToggle} />
      </div>
      <Separator />
    </header>
  );
}

type DetailSidebarHeaderCloseProps = {
  onClose: () => void;
};

function DetailSidebarHeaderClose({ onClose }: DetailSidebarHeaderCloseProps) {
  const { t } = useTranslation();
  return (
    <Button
      aria-label={t("detailSidebar.collapse")}
      className="size-5 rounded-sm border-0"
      onClick={onClose}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <X aria-hidden className="size-5" />
    </Button>
  );
}
