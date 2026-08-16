import { useState, type ReactNode } from "react";

import { ResizeHandle } from "@/components/app/ResizeHandle";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";
import { useTranslation } from "react-i18next";

type DetailSidebarProps = {
  children?: ReactNode;
  header?: ReactNode;
};

const MIN_DETAIL_SIDEBAR_WIDTH = 200;
const MAX_DETAIL_SIDEBAR_WIDTH = 480;
const DEFAULT_DETAIL_SIDEBAR_WIDTH = 256;

export function DetailSidebar({
  children,
  header,
}: DetailSidebarProps) {
  const { t } = useTranslation();
  const detailSidebar = useDetailSidebar();
  const isOpen = detailSidebar?.isOpen ?? true;
  const [sidebarWidth, setSidebarWidth] = useState(
    DEFAULT_DETAIL_SIDEBAR_WIDTH,
  );

  const resizeSidebar = (deltaX: number) => {
    const maxWidth = Math.max(
      MIN_DETAIL_SIDEBAR_WIDTH,
      Math.min(MAX_DETAIL_SIDEBAR_WIDTH, window.innerWidth - 160),
    );

    setSidebarWidth((currentWidth) =>
      Math.min(
        Math.max(currentWidth + deltaX, MIN_DETAIL_SIDEBAR_WIDTH),
        maxWidth,
      ),
    );
  };

  return (
    <aside
      aria-label={t("detailSidebar.label")}
      className="flex h-full shrink-0 overflow-hidden bg-transparent pt-2"
      style={{ width: isOpen ? `${sidebarWidth}px` : "0px" }}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col pl-2 pr-1 rounded-md bg-sidebar text-muted-foreground">
        {/* ヘッダー : ページ名 + 閉じるボタン */}
        {header}
        <div className="hover-scrollbar-y min-h-0 w-full flex-1 overflow-y-auto">
          {/* 項目一覧 */}
          {children}
        </div>
      </div>
      {/* サイズ変更バー */}
      <ResizeHandle
        aria-label={t("detailSidebar.resize")}
        aria-valuemax={MAX_DETAIL_SIDEBAR_WIDTH}
        aria-valuemin={MIN_DETAIL_SIDEBAR_WIDTH}
        aria-valuenow={sidebarWidth}
        onResize={resizeSidebar}
        tabIndex={isOpen ? 0 : -1}
      />
    </aside>
  );
}
