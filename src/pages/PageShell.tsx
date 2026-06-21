import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/app/Breadcrumbs";
import { DetailSidebar, DetailSidebarToggle } from "@/layout/DetailSidebar";
import { TabPageHistoryControls } from "@/components/app/TabPageHistoryControls"; 

export type { BreadcrumbItem } from "@/components/app/Breadcrumbs";

type PageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
};

export function PageShell({
  breadcrumbs,
  children,
}: PageShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const rootBreadcrumbLabel =
    typeof breadcrumbs[0]?.label === "string"
      ? breadcrumbs[0].label.toLowerCase()
      : "";
  const showsDetailSidebar =
    rootBreadcrumbLabel === "projects" || rootBreadcrumbLabel === "wiki";

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
        className={`flex items-center ${
          isContentScrolled ? "shadow-[-6px_6px_6px_-6px_var(--shadow)]" : ""
        }`}
      >
        <DetailSidebarToggle/>
        <TabPageHistoryControls />
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showsDetailSidebar && <DetailSidebar />}
        <div
          className="min-h-0 flex-1 overflow-hidden px-[16px] py-[8px]"
          onScrollCapture={updateContentScrolled}
          ref={contentRef}
        >
          {children}
        </div>
      </div>
    </section>
  );
}