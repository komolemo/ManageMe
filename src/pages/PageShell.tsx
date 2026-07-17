import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/app/Breadcrumbs";
import { useDetailSidebar } from "@/layout/DetailSidebarContext";
import { TabPageHistoryControls } from "@/components/app/TabPageHistoryControls"; 

export type { BreadcrumbItem } from "@/components/app/Breadcrumbs";

type PageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  contentHeader?: ReactNode;
  detailSidebar?: ReactNode;
  detailSidebarAddLabel?: string;
  detailSidebarFilterLabel?: string;
  detailSidebarOnAddFile?: () => void;
  detailSidebarOnFilterChange?: (query: string) => void;
  detailSidebarOnOpenProject?: () => void;
};

export function PageShell({
  breadcrumbs,
  children,
  contentHeader,
  detailSidebar,
  detailSidebarAddLabel,
  detailSidebarFilterLabel,
  detailSidebarOnAddFile,
  detailSidebarOnFilterChange,
  detailSidebarOnOpenProject,
}: PageShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const detailSidebarContext = useDetailSidebar();
  const onDetailSidebarConfigChange = detailSidebarContext?.onConfigChange;
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const rootBreadcrumbLabel =
    typeof breadcrumbs[0]?.label === "string"
      ? breadcrumbs[0].label.toLowerCase()
      : "";
  const showsDetailSidebar =
    Boolean(detailSidebar) ||
    rootBreadcrumbLabel === "projects" ||
    rootBreadcrumbLabel === "document";

  useLayoutEffect(() => {
    if (!onDetailSidebarConfigChange) {
      return;
    }

    onDetailSidebarConfigChange(
      showsDetailSidebar
        ? {
            addLabel: detailSidebarAddLabel,
            children: detailSidebar,
            filterLabel: detailSidebarFilterLabel,
            onAddFile: detailSidebarOnAddFile,
            onFilterChange: detailSidebarOnFilterChange,
            onOpenProject: detailSidebarOnOpenProject,
          }
        : null,
    );

    return () => onDetailSidebarConfigChange(null);
  }, [
    detailSidebar,
    detailSidebarAddLabel,
    detailSidebarFilterLabel,
    detailSidebarOnAddFile,
    detailSidebarOnFilterChange,
    detailSidebarOnOpenProject,
    onDetailSidebarConfigChange,
    showsDetailSidebar,
  ]);

  const updateContentScrolled = useCallback(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      setIsContentScrolled(false);
      return;
    }

    const scrollableElements = [
      contentElement,
      ...contentElement.querySelectorAll<HTMLElement>("*"),
    ];

    setIsContentScrolled(
      scrollableElements.some((element) => element.scrollTop > 0),
    );
  }, []);

  useEffect(() => {
    updateContentScrolled();
  }, [children, updateContentScrolled]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div
        className={`relative z-10 flex shrink-0 items-center bg-card ${
          isContentScrolled ? "shadow-[-6px_6px_6px_-6px_var(--shadow)]" : ""
        }`}
      >
        <TabPageHistoryControls />
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {contentHeader ? (
            <div className="shrink-0 px-[16px] py-[8px]">
              {contentHeader}
            </div>
          ) : null}
          <div
            className={`hover-scrollbar-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-[16px] [scrollbar-gutter:stable] ${
              contentHeader ? "pb-[8px]" : "py-[8px]"
            }`}
            onScrollCapture={updateContentScrolled}
            ref={contentRef}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
