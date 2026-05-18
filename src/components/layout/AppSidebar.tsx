import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { PageKey } from "@/pages/pageTypes";

type AppSidebarProps = {
  onNavigate: (page: PageKey) => void;
};

const projectItems = ["ManageMe Core", "Knowledge Wiki", "Desktop Shell"];
const wikiItems = ["ManageMe Wiki", "Requirements Wiki", "Design Wiki"];

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const [isProjectListOpen, setIsProjectListOpen] = useState(true);
  const [isWikiListOpen, setIsWikiListOpen] = useState(true);

  return (
    <aside
      className="min-h-[calc(100vh-56px)] shrink-0 overflow-hidden border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="grid w-[180px] gap-4">
          {/* <Button variant="outline" className="w-full h-[40px] gap-[4px] justify-start bg-sidebar-accent text-sidebar-accent-foreground">
            <Search className="size-4" />
            Search
          </Button> */}

          <Separator />

          <SidebarGroup
            title="Projects"
            items={projectItems}
            icon={<CircleDot className="size-3 text-current" />}
            isOpen={isProjectListOpen}
            menuLabel="projectListPage"
            onMenuNavigate={() => onNavigate("projects")}
            onItemClick={() => onNavigate("project")}
            onToggle={() => setIsProjectListOpen((isOpen) => !isOpen)}
          />
          <SidebarGroup
            title="Wiki"
            items={wikiItems}
            icon={<FileText className="size-3 text-current" />}
            isOpen={isWikiListOpen}
            menuLabel="projectWikiListPage"
            onMenuNavigate={() => onNavigate("projectWikiList")}
            onItemClick={() => onNavigate("projectWiki")}
            onToggle={() => setIsWikiListOpen((isOpen) => !isOpen)}
          />
      </div>
    </aside>
  );
}

// type SidebarButtonProps = {
//   active?: boolean;
//   icon: ReactElement;
//   label: string;
//   onClick: () => void;
// };

// function SidebarButton({ active, icon, label, onClick }: SidebarButtonProps) {
//   return (
//     <button
//       className={`flex items-center gap-2 border border-solid px-[8px] text-left text-xs transition-colors ${
//         active
//           ? "border-sidebar-border bg-sidebar-accent font-medium text-sidebar-accent-foreground"
//           : "border-sidebar-border bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//       }`}
//       onClick={onClick}
//       type="button"
//     >
//       {icon}
//       <span>{label}</span>
//       <ChevronRight className="ml-auto size-3" />
//     </button>
//   );
// }

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
    <section className="grid gap-2">
      <div
        className="flex h-[40px] items-center gap-2 border border-solid border-sidebar-border bg-transparent px-[8px] text-left text-[14px] font-semibold uppercase text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={`${title} menu`}
              className="grid size-6 place-items-center border border-sidebar-border bg-sidebar text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={(event) => event.stopPropagation()}
              type="button"
            >
              <MoreHorizontal className="size-4 text-current" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                onMenuNavigate();
              }}
            >
              {menuLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isOpen && (
        <div className="grid gap-1">
          {items.map((item) => (
            <button
              className="flex h-[32px] items-center gap-[4px] border border-solid border-sidebar-border bg-sidebar px-[8px] py-[6px] text-left text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              key={item}
              onClick={onItemClick}
              type="button"
            >
              {icon}
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
