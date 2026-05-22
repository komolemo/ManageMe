import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  FileText,
  KanbanSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PageKey } from "@/pages/pageTypes";

type AppSidebarProps = {
  onNavigate: (page: PageKey) => void;
};

const projectItems = ["ManageMe Core", "Knowledge Wiki", "Desktop Shell"];
const wikiItems = ["ManageMe Wiki", "Requirements Wiki", "Design Wiki"];

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectListOpen, setIsProjectListOpen] = useState(true);
  const [isWikiListOpen, setIsWikiListOpen] = useState(true);
  const SidebarToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <aside
      className={`min-h-[calc(100vh-56px)] shrink-0 overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out ${
        isSidebarOpen ? "w-[180px]" : "w-[56px]"
      }`}
      aria-label="Primary sidebar"
    >
      <div
        className={`grid gap-4 ${
          isSidebarOpen ? "w-[180px]" : "w-[56px]"
        }`}
      >
        <div
          className={`flex w-full ${
            isSidebarOpen ? "justify-end" : "justify-center"
          }`}
        >
          <button
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isSidebarOpen}
            className="grid mb-[4px] py-[8px] place-items-center border-0 bg-transparent text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            type="button"
          >
            <SidebarToggleIcon className="size-4" />
          </button>
        </div>

        {isSidebarOpen ? (
          <>
            <button
              className="mx-[8px] my-[8px] px-[8px] flex h-[40px] items-center justify-start gap-[8px] rounded-lg border-0 bg-transparent px-[4px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("search")}
              type="button"
            >
              <Search className="size-4" />
              Search
            </button>

            <Separator />

          <SidebarGroup
            title="Projects"
            items={projectItems}
            icon={<CircleDot className="size-3 text-current" />}
            isOpen={isProjectListOpen}
            menuLabel="Project一覧"
            onMenuNavigate={() => onNavigate("projects")}
            onItemClick={() => onNavigate("project")}
            onToggle={() => setIsProjectListOpen((isOpen) => !isOpen)}
          />
          <SidebarGroup
            title="Wiki"
            items={wikiItems}
            icon={<FileText className="size-3 text-current" />}
            isOpen={isWikiListOpen}
            menuLabel="Wiki一覧"
            onMenuNavigate={() => onNavigate("projectWikiList")}
            onItemClick={() => onNavigate("projectWiki")}
            onToggle={() => setIsWikiListOpen((isOpen) => !isOpen)}
          />
          </>
        ) : (
          <div className="grid gap-[8px]">
            <Button
              aria-label="Search"
              className="border-t h-[54px] gap-[4px] mx-[2px] mt-[10px] px-[2px] py-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("search")}
              size="icon"
              type="button"
            >
              <Search className="size-4" />
              <span className="text-[10px]">検索</span>
            </Button>
            <Button
              aria-label="Projects"
              className="border-t gap-[4px] mx-[2px] px-[2px] py-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("projects")}
              size="icon"
              type="button"
            >
              <KanbanSquare className="size-3 text-current" />
              <span className="text-[10px]">ﾌﾟﾛｼﾞｪｸﾄ</span>
            </Button>
            <Button
              aria-label="Wiki"
              className="border-t gap-[4px] mx-[2px] px-[2px] py-[4px] flex flex-col items-center justify-center rounded-lg bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => onNavigate("projectWikiList")}
              size="icon"
              type="button"
            >
              <FileText className="size-3 text-current" />
              <span className="text-[10px]">Wiki</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

type SidebarGroupProps = {
  title: string;
  items: string[];
  icon: ReactElement;
  isOpen: boolean;
  menuLabel: string;
  onMenuNavigate: () => void;
  onItemClick: () => void;
  onToggle: () => void;
};

function SidebarGroup({
  title,
  items,
  icon,
  isOpen,
  menuLabel,
  onMenuNavigate,
  onItemClick,
  onToggle,
}: SidebarGroupProps) {
  return (
    <section className="grid px-[8px] py-[8px] border-t">
      <div
        className="flex h-[40px] px-[8px] gap-[8px] items-center rounded-lg border-0 bg-transparent text-left text-[14px] font-semibold uppercase text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={onToggle}
        aria-expanded={isOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </div>
      {isOpen && (
        <div className="grid">
          {items.map((item) => (
            <button
              className="flex h-[40px] px-[8px] py-[8px] items-center gap-[8px] border-0 bg-sidebar rounded-lg text-left text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              key={item}
              onClick={onItemClick}
              type="button"
            >
              {icon}
              <span>{item}</span>
            </button>
          ))}
          <button
              className="flex h-[40px] px-[8px] py-[8px] gap-[8px] text-[12px] items-center rounded-lg border-0 bg-transparent text-left text-[14px] font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onMenuNavigate}
              type="button"
          >
            <ArrowRight className="size-3" />
            <span>{menuLabel}</span>
          </button>
        </div>
      )}
    </section>
  );
}
