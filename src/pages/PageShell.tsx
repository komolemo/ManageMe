import type { MouseEvent, ReactNode } from "react";

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
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div className="px-[16px] py-[4px] shadow-[0_6px_6px_-6px_var(--shadow)]">
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 my-[0px] px-[0px] flex-wrap items-center gap-[6px] text-xs text-muted-foreground">
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
      <div className="min-h-0 flex-1 overflow-hidden pl-[16px]">{children}</div>
    </section>
  );
}
