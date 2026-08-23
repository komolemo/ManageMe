import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/components/app/Breadcrumbs";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";
import { DetailSidebarHeader } from "@/layout/DetailSidebar/DetailSidebarHeader";
import { PageDetailSidebar } from "@/layout/PageShell/PageDetailSidebar";
import { PageHeader } from "@/layout/PageShell/PageHeader";
import { TabHeader } from "@/layout/TabHeader/TabHeader";

export type { BreadcrumbItem } from "@/components/app/Breadcrumbs";

type PageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  contentHeader?: ReactNode;
  detailSidebar?: ReactNode;
  detailSidebarHeader?: ReactNode;
  detailSidebarToolbar?: ReactNode;
};

export function PageShell({
  breadcrumbs,
  children,
  contentHeader,
  detailSidebar,
  detailSidebarHeader,
  detailSidebarToolbar,
}: PageShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const detailSidebarContext = useDetailSidebar();
  const onDetailSidebarConfigChange = detailSidebarContext?.onConfigChange;
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const defaultDetailSidebarName =
    [...breadcrumbs]
      .reverse()
      .find((breadcrumb) => typeof breadcrumb.label === "string")
      ?.label as string | undefined;
  const resolvedDetailSidebarHeader = useMemo(
    () =>
      detailSidebarHeader ?? (
        <DetailSidebarHeader name={defaultDetailSidebarName ?? ""} />
      ),
    [defaultDetailSidebarName, detailSidebarHeader],
  );

  useLayoutEffect(() => {
    if (!onDetailSidebarConfigChange) {
      return;
    }

    onDetailSidebarConfigChange({
      children: detailSidebar,
      header: resolvedDetailSidebarHeader,
      toolbar: detailSidebarToolbar,
    });

    return () => onDetailSidebarConfigChange(null);
  }, [
    detailSidebar,
    detailSidebarToolbar,
    onDetailSidebarConfigChange,
    resolvedDetailSidebarHeader,
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
      <TabHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <PageDetailSidebar
          header={resolvedDetailSidebarHeader}
          toolbar={detailSidebarToolbar}
        >
          {detailSidebar}
        </PageDetailSidebar>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {contentHeader ? (
            <div
              className={`relative z-10 shrink-0 bg-card py-2 ${
                isContentScrolled
                  ? "shadow-[-6px_6px_6px_-6px_var(--shadow)]"
                  : ""
              }`}
            >
              <PageHeader breadcrumbs={breadcrumbs}>
                {contentHeader}
              </PageHeader>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className={`hover-scrollbar-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${
                contentHeader ? "pb-[8px]" : "py-[8px]"
              }`}
              onScrollCapture={updateContentScrolled}
              ref={contentRef}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
