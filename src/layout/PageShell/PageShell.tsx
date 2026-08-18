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
import { SearchForm } from "@/components/app/SearchForm";
import { AIChatToggle } from "@/layout/AIChat";
import { useOpenAIChat } from "@/layout/AIChatContext";
import { useAppSearch } from "@/layout/AppSearchContext";
import { DetailSidebar } from "@/layout/DetailSidebar/DetailSidebar";
import { useDetailSidebar } from "@/layout/DetailSidebar/DetailSidebarContext";
import { DetailSidebarHeader } from "@/layout/DetailSidebar/DetailSidebarHeader";
import { DetailSidebarToggle } from "@/layout/DetailSidebar/DetailSidebarToggle";
import { TabPageHistoryControls } from "@/components/app/TabPageHistoryControls";
import { PageHeader } from "@/layout/PageShell/PageHeader";

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
  const onSearch = useAppSearch();
  const openAIChat = useOpenAIChat();
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

  // grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div
        className={`relative z-10 mt-1 h-10 shrink-0 items-center bg-card px-1 grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] ${
          isContentScrolled ? "shadow-[-6px_6px_6px_-6px_var(--shadow)]" : ""
        }`}
      >
        <div className="flex min-w-0 items-center overflow-hidden">
          {/* <DetailSidebarToggle /> */}
          <TabPageHistoryControls />
          {/* <DetailSidebarToggle /> */}
          {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
        </div>
        {onSearch ? <SearchForm className="w-full sm:hidden md:inline-flex" onSearch={onSearch} /> : <div />}
        <div className="justify-self-end">
          {openAIChat ? <AIChatToggle onOpen={openAIChat} /> : null}
        </div>
      </div>
      {contentHeader ? (
        <div className="shrink-0 px-[16px] py-[8px]">
          <PageHeader breadcrumbs={breadcrumbs}>
            {contentHeader}
          </PageHeader>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {detailSidebar ? (
          <div
            className={
              detailSidebarContext?.isOpen ? "min-w-[200px]" : "min-w-0"
            }
          >
            {detailSidebarContext?.isOpen ? (
              <DetailSidebar
                header={resolvedDetailSidebarHeader}
                toolbar={detailSidebarToolbar}
              >
                {detailSidebar}
              </DetailSidebar>
            ) : (
              <div className="px-1">
                <DetailSidebarToggle />
              </div>              
            )}
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
    </section>
  );
}
