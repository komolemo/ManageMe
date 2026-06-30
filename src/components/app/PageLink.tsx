import type { LucideIcon } from "lucide-react";

type PageLinkProps = {
  displayName?: string;
  icon: LucideIcon;
  pageName: string;
};

export function PageLink({ displayName, icon: Icon, pageName }: PageLinkProps) {
  return (
    <>
      <Icon className="mr-[4px] size-4 shrink-0 text-current" />
      <span className="min-w-0 truncate" title={pageName}>
        {displayName ?? pageName}
      </span>
    </>
  );
}
