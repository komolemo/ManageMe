import type { ReactNode } from "react";

type DetailSidebarToolbarProps = {
  children: ReactNode;
};

export function DetailSidebarToolbar({
  children,
}: DetailSidebarToolbarProps) {
  return <div className="shrink-0 h-9">{children}</div>;
}
