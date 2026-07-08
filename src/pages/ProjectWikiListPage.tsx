import {
  BookOpenText,
  MoreHorizontal,
} from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";

const wikis = ["ManageMe Wiki", "Requirements Wiki", "Design Wiki"];

type ProjectWikiListPageProps = {
  onOpenWiki: (wikiTitle: string) => void;
  onOpenWikiInNewTab: (wikiTitle: string) => void;
};

export function ProjectWikiListPage({
  onOpenWiki,
  onOpenWikiInNewTab,
}: ProjectWikiListPageProps) {
  const openWikiWithMouseWheel = (
    event: MouseEvent<HTMLElement>,
    wikiTitle: string
  ) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenWikiInNewTab(wikiTitle);
  };

  return (
    <PageShell breadcrumbs={[{ label: "Wiki" }, { label: "1" }]}>
      <div className="grid">
        {wikis.map((wiki) => (
          <Card
            className="
              py-[8px] border-t ring-0 pr-[16px] cursor-pointer
              transition-colors hover:bg-muted/40 focus-visible:outline-none
              focus-visible:ring-[3px] focus-visible:ring-ring/50
            "
            key={wiki}
            onClick={() => onOpenWiki(wiki)}
            onAuxClick={(event) => openWikiWithMouseWheel(event, wiki)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenWiki(wiki);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <CardHeader>
              <div className="flex min-w-0 items-start gap-[16px]">
                <span className="mt-[6px] flex w-[32px] h-[32px] shrink-0 items-center justify-center">
                  <BookOpenText className="size-8 text-current" />
                </span>
                <div className="grid min-w-0 flex-1 gap-[4px]">
                  <CardTitle className="flex min-w-0 items-center gap-[8px]">
                    <span className="min-w-0 flex-1 truncate">{wiki}</span>
                    <Button
                      aria-label={`${wiki} actions`}
                      className="w-[32px] h-[32px] border-0 rounded-full bg-transparent hover:bg-muted/70 data-[state=open]:bg-muted/70"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <MoreHorizontal className="size-6 text-foreground" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-[15px]">
                    Project Wiki for Task Wiki pages
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
