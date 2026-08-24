import type { MouseEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  onAuxClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

type BreadcrumbsProps = {
  breadcrumbs: BreadcrumbItem[];
};

export function Breadcrumbs({
  breadcrumbs
}: BreadcrumbsProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("a11y.breadcrumb")} className="min-w-0 flex">
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
  );
}
