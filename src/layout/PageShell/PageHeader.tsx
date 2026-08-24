import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/app/Breadcrumbs";

type PageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  children?: ReactNode;
};

export function PageHeader({
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 shrink-0 items-center">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      {children}
    </div>
  );
}
