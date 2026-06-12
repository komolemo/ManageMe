import {
  BookOpenText,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectWikiSidebar } from "@/layout/ProjectWikiSidebarContext";
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
  const projectWikiSidebar = useProjectWikiSidebar();
  const SidebarIcon = projectWikiSidebar?.isOpen
    ? PanelLeftClose
    : PanelLeftOpen;
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
    <>
      {projectWikiSidebar && (
        <Button
          aria-label={
            projectWikiSidebar.isOpen
              ? "Collapse Sidebar 2"
              : "Expand Sidebar 2"
          }
          onClick={projectWikiSidebar.onToggle}
          size="icon-sm"
          type="button"
          variant="outline"
          className="size-8 border-border bg-background px-[16px] py-[8px] text-foreground hover:bg-muted hover:text-foreground"
        >
          <SidebarIcon className="size-[24px] text-current" />
        </Button>
      )}
      <PageShell
        badge="Wiki / 1"
        title="Project (Wiki) List Page"
        description="Project Wiki pages."
      >
        <div className="grid md:grid-cols-3">
          {wikis.map((wiki) => (
            <Card
              className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
              <CardHeader className="p-[8px]">
                <CardTitle
                  className="grid items-center gap-[8px]"
                  style={{ gridTemplateColumns: "16px minmax(0, 1fr) 16px" }}
                >
                  <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                    <BookOpenText className="size-4 text-current" />
                  </span>
                  <span className="min-w-0 truncate">{wiki}</span>
                  <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                    <MoreHorizontal className="size-4 text-current" />
                  </span>
                </CardTitle>
                <CardDescription>Project Wiki for Task Wiki pages</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PageShell>
    </>
  );
}
