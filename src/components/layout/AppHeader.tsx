import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Bell, FileText, FolderKanban, Search, Settings, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchSuggestions } from "@/components/layout/searchSuggestions";
import type { PageKey } from "@/pages/pageTypes";

type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
};

const searchClearButtonStyle = {
  buttonSize: "24px",
  iconSize: "14px",
  color: "var(--muted-foreground)",
} as const;

export function AppHeader({ onNavigate }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trimmedSearchQuery = searchQuery.trim();
  const searchClearButtonVars = {
    "--header-search-clear-button-size": searchClearButtonStyle.buttonSize,
    "--header-search-clear-icon-size": searchClearButtonStyle.iconSize,
    "--header-search-clear-color": searchClearButtonStyle.color,
  } as CSSProperties;
  const visibleSuggestions = useMemo(() => {
    const normalizedQuery = trimmedSearchQuery.toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchSuggestions
      .filter((suggestion) => {
        const searchableText = [
          suggestion.kind,
          suggestion.title,
          suggestion.scope,
          suggestion.excerpt,
          ...suggestion.keywords,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [trimmedSearchQuery]);
  const showsSuggestions = isSearchFocused && Boolean(trimmedSearchQuery);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedSearchQuery) {
      return;
    }
  };

  return (
    <header
      className="
        sticky top-0 z-40 flex h-[48px] items-center justify-between
        gap-[8px] border-b bg-background px-[8px] text-foreground md:px-[20px]"
    >
      <div className="flex min-w-0 shrink-0 items-center gap-[4px]">
        <h1 className="my-[0px] truncate text-[20px] font-semibold">ManageMe</h1>
      </div>

      <form
        className="
          relative flex h-[32px] min-w-[120px] max-w-[400px] flex-1 items-center
          gap-[4px] rounded-full border border-input bg-background
          pl-[16px] text-foreground dark:bg-input/30
        "
        onSubmit={handleSearch}
      >
        <label className="sr-only" htmlFor="header-search">
          Search
        </label>
        <Input
          aria-label="Search"
          className="
            border-0 bg-transparent px-[0px] text-foreground
            placeholder:text-muted-foreground focus-visible:ring-0
            dark:bg-transparent
          "
          id="header-search"
          onBlur={() => setIsSearchFocused(false)}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search"
          type="search"
          value={searchQuery}
        />
        {searchQuery && (
          <Button
            aria-label="Clear search"
            className="
              size-[var(--header-search-clear-button-size)] border-0 bg-transparent p-0
              text-[var(--header-search-clear-color)] hover:bg-muted hover:text-foreground
              dark:bg-transparent dark:hover:bg-muted
            "
            onClick={() => setSearchQuery("")}
            size="icon-xs"
            style={searchClearButtonVars}
            type="button"
            variant="ghost"
          >
            <X
              aria-hidden="true"
              className="size-[var(--header-search-clear-icon-size)] text-current"
            />
          </Button>
        )}
        <Button
          aria-label="Search"
          className="
            h-full rounded-r-full border-0 border-l border-input bg-transparent text-foreground pl-[8px] pr-[12px]
            hover:bg-accent hover:text-accent-foreground
            dark:bg-transparent dark:hover:bg-accent 
          "
          disabled={!trimmedSearchQuery}
          size="icon-sm"
          type="submit"
          variant="outline"
        >
          <Search className="size-4 text-current" />
        </Button>
        {showsSuggestions && (
          <div
            className="
              absolute left-1/2 top-[calc(100%+4px)] z-50 grid rounded-md
              w-[calc(100vw-16px)] max-w-[400px] -translate-x-1/2
              overflow-hidden border-0 bg-popover text-popover-foreground
              shadow-lg shadow-foreground/10 dark:bg-popover-2 dark:text-popover-foreground
              dark:shadow-black/40
              sm:left-0 sm:w-full sm:min-w-[320px] sm:translate-x-0
            "
            role="listbox"
          >
            {visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((suggestion) => {
                const SuggestionIcon =
                  suggestion.kind === "project" ? FolderKanban : FileText;

                return (
                  <button
                    className="
                      grid min-w-0 gap-[6px] border-0 px-[12px] py-[10px]
                      bg-popover text-left text-popover-foreground last:border-b-0
                      hover:bg-muted focus-visible:bg-muted
                      dark:bg-popover-2 dark:hover:bg-accent-2 dark:focus-visible:bg-accent
                    "
                    key={suggestion.id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setSearchQuery(suggestion.title);
                      setIsSearchFocused(false);
                    }}
                    role="option"
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-[8px]">
                      <span
                        className="
                          grid size-[24px] shrink-0 place-items-center border-0 bg-transparent 
                          text-muted-foreground dark:text-foreground
                        "
                      >
                        <SuggestionIcon className="size-4 text-current" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {suggestion.title}
                      </span>
                      <Badge className="h-[20px] shrink-0 border-0" variant="outline">
                        {suggestion.scope}
                      </Badge>
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {suggestion.excerpt}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="bg-popover px-[12px] py-[10px] text-xs text-muted-foreground dark:bg-popover-2 dark:text-muted-foreground">
                No suggestions found
              </div>
            )}
          </div>
        )}
      </form>

      <div className="flex shrink-0 items-center gap-[8px]">
        <Button
          aria-label="Notifications"
          className="
            border-0 bg-transparent text-foreground rounded-full w-[40px] h-[40px]
            hover:bg-muted hover:text-foreground
            dark:bg-transparent dark:hover:bg-muted
          "
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="size-4 text-current" />
        </Button>
        <Button
          aria-label="Settings"
          className="
            border-0  bg-transparent text-foreground rounded-full w-[40px] h-[40px]
            hover:bg-muted hover:text-foreground
            dark:bg-transparent dark:hover:bg-muted
          "
          onClick={() => onNavigate("settings")}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Settings className="size-4 text-current" />
        </Button>
      </div>
    </header>
  );
}
