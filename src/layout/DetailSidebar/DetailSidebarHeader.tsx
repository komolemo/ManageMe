import { useTranslation } from "react-i18next";
import { XButton } from "@/components/app/XButton";
import { Separator } from "@/components/ui/separator";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";

// ================================================================
// 詳細サイドバーヘッダー

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
      <div className="relative z-10 flex items-center justify-between gap-2 pt-1 pb-1">
        {/* ページ名 */}
        <span className="min-w-0 truncate text-sm font-medium" title={name}>
          {name}
        </span>
        {/* 詳細サイドバー閉じるボタン */}
        <DetailSidebarHeaderClose onClose={detailSidebar.onToggle} />
      </div>
      <Separator />
    </header>
  );
}

// ================================================================
// 詳細サイドバー閉じるボタン

type DetailSidebarHeaderCloseProps = {
  onClose: () => void;
};

function DetailSidebarHeaderClose({ onClose }: DetailSidebarHeaderCloseProps) {
  const { t } = useTranslation();
  return (
    <XButton
      label={t("detailSidebar.collapse")}
      onClick={onClose}
      size="icon-xs"
    />
  );
}
