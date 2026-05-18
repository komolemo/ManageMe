import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageShellProps = {
  title: string;
  description: string;
  badge: string;
  children: ReactNode;
};

export function PageShell({ title, description, badge, children }: PageShellProps) {
  return (
    <section className="bg-card text-card-foreground">
      <div className="border-b p-[16px]">
        <Badge variant="outline">{badge}</Badge>
        <h1 className="mt-3 text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="p-[16px]">{children}</div>
    </section>
  );
}
