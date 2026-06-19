import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { DetailSidebar, DetailSidebarToggle } from "@/layout/DetailSidebar";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  onAuxClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

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
        className={`flex items-start ${
          isContentScrolled ? "shadow-[-6px_6px_6px_-6px_var(--shadow)]" : ""
        }`}
      >
        <nav aria-label="Breadcrumb" className="min-w-0 flex">
          {showsDetailSidebar && <DetailSidebarToggle />}
          <ol className="flex min-w-0 my-[0px] pl-[8px] py-[4px] flex-wrap items-center gap-[6px] text-xs text-muted-foreground">
            {breadcrumbs.map((breadcrumb, index) => {
              const isCurrent = index === breadcrumbs.length - 1;

              return (
                <li
                  className="flex min-w-0 items-center gap-[6px]"
                  key={`${index}-${String(breadcrumb.label)}`}
                >
                  {index > 0 && <span aria-hidden="true">&gt;</span>}
                  {isCurrent || (!breadcrumb.href && !breadcrumb.onClick) ? (
                    <span
                      aria-current={isCurrent ? "page" : undefined}
                      className="min-w-0 truncate text-[12px] text-muted-forground"
                    >
                      {breadcrumb.label}
                    </span>
                  ) : breadcrumb.href ? (
                    <a
                      className="min-w-0 truncate text-[12px] underline-offset-4 hover:text-foreground hover:underline"
                      href={breadcrumb.href}
                    >
                      {breadcrumb.label}
                    </a>
                  ) : (
                    <button
                      className="min-w-0 cursor-pointer truncate border-0 bg-transparent p-[0px] text-left text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onAuxClick={breadcrumb.onAuxClick}
                      onClick={breadcrumb.onClick}
                      type="button"
                    >
                      {breadcrumb.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showsDetailSidebar && <DetailSidebar />}
        <div
          className="min-h-0 flex-1 overflow-hidden pt-[8px] pl-[16px]"
          onScrollCapture={updateContentScrolled}
          ref={contentRef}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
