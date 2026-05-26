import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageShellProps = {
  title: string;
  titleContent?: ReactNode;
  description: string;
  badge: string;
  children: ReactNode;
};

export function PageShell({
  title,
  titleContent,
  description,
  badge,
  children,
}: PageShellProps) {
  return (
    <section className="bg-card text-card-foreground">
      <div className="border-b px-[16px] pt-[16px]">
        <Badge
          className="border-0 text-muted-foreground hover:text-foreground"
          variant="outline"
        >{badge}</Badge>
        {titleContent ? (
          <div className="mt-[8px] my-[8px]">{titleContent}</div>
        ) : (
          <h1 className="mt-[8px] my-[8px] font-semibold">{title}</h1>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="p-[16px]">{children}</div>
    </section>
  );
}
