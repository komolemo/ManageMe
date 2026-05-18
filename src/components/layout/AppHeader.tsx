import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PageKey } from "@/pages/pageTypes";

type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
};

export function AppHeader({ onNavigate }: AppHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-40 flex h-[48px] items-center justify-between
        gap-[8px] border-b bg-background px-[8px] md:px-[20px]"
    >
      <div className="flex shrink-0 items-center gap-[4px]">
        <h1 className="my-[0px] text-[20px] font-semibold">ManageMe</h1>
      </div>

      <form
        className="
          flex h-[32px] min-w-[160px] max-w-[400px] flex-1 items-center
          gap-[4px] rounded-full border border-input bg-background
          pl-[16px] pr-[8px] text-foreground dark:bg-input/30
        "
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="header-search">
          Search
        </label>
        <Input
          aria-label="Search"
          className="
            border-0 bg-background px-[0px] text-foreground
            placeholder:text-muted-foreground focus-visible:ring-0
            dark:bg-transparent
          "
          id="header-search"
          placeholder="Search"
          type="search"
        />
        <Button
          aria-label="Search"
          className="
            border border-input bg-background text-foreground
            hover:bg-accent hover:text-accent-foreground
            dark:bg-input/30 dark:hover:bg-accent
          "
          size="icon-sm"
          type="submit"
          variant="outline"
        >
          <Search className="size-4 text-current" />
        </Button>
      </form>

      <div className="flex shrink-0 items-center gap-[4px]">
        <Button
          aria-label="Notifications"
          className="
            border-border bg-background text-foreground
            hover:bg-muted hover:text-foreground
            dark:bg-input/30 dark:hover:bg-muted
          "
          size="icon-sm"
          variant="outline"
        >
          <Bell className="size-4 text-current" />
        </Button>
        <Button
          className="
            border-border bg-background text-foreground
            hover:bg-muted hover:text-foreground
            dark:bg-input/30 dark:hover:bg-muted
          "
          onClick={() => onNavigate("settings")}
          size="sm"
          variant="outline"
        >
          <Settings className="size-4 text-current" />
        </Button>
      </div>
    </header>
  );
}
