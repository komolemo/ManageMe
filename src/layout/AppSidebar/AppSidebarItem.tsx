import { BookA, Search } from "lucide-react";
import type { MouseEventHandler, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// ================================================================================================================================
// AppSidebarItem()
// サイドバーが開いた状態に表示される、「検索」「辞書」の2項目用のボタン

type AppSidebarItemProps = {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  onAuxClick: MouseEventHandler<HTMLButtonElement>;
};

type AppSidebarNavigationItemProps = Pick<
  AppSidebarItemProps,
  "onClick" | "onAuxClick"
>;

export function AppSidebarItem({
  icon,
  label,
  onClick,
  onAuxClick,
}: AppSidebarItemProps) {
  return (
    <button
      className="mx-2 my-[7px] flex h-[40px] w-[152px] cursor-pointer items-center justify-start gap-2 rounded-lg border-0 bg-transparent px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
      onClick={onClick}
      onAuxClick={onAuxClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function AppSidebarSearch(props: AppSidebarNavigationItemProps) {
  const { t } = useTranslation();

  return (
    <AppSidebarItem
      icon={<Search className="size-6" />}
      label={t("sidebar.search")}
      {...props}
    />
  );
}

export function AppSidebarDictionary(props: AppSidebarNavigationItemProps) {
  const { t } = useTranslation();

  return (
    <AppSidebarItem
      icon={<BookA className="size-6 text-current" />}
      label={t("sidebar.dictionary")}
      {...props}
    />
  );
}

// ================================================================================================================================
// AppSidebarSimpleItem()
// サイドバーを閉じた状態に表示される「アイコン + 項目名」のみで構成されるシンプルなボタン

export function AppSidebarSimpleItem({
  icon,
  label,
  onClick,
  onAuxClick,
}: AppSidebarItemProps) {
  return (
    <Button
      aria-label={label}
      className="border-t w-[52px] h-[52px] gap-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground"
      onClick={onClick}
      onAuxClick={onAuxClick}
      size="icon"
      type="button"
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </Button>
  );
}
