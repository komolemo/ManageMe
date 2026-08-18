import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/app/Breadcrumbs";
import { DetailSidebarToggle } from "@/layout/DetailSidebar/DetailSidebarToggle";

type PageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  children?: ReactNode;
  showDetailSidebarToggle?: boolean;
};

export function PageHeader({
  breadcrumbs,
  children,
  showDetailSidebarToggle = false,
}: PageHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 shrink-0 items-center">
        {showDetailSidebarToggle ? <DetailSidebarToggle /> : null}
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      {children}
    </div>
  );
}
