import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Bell, FileText, FolderKanban, Search, Settings, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchSuggestions } from "@/components/layout/searchSuggestions";
import type { PageKey } from "@/pages/pageTypes";

type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
};

type UnreadNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

const searchClearButtonStyle = {
  buttonSize: "24px",
  iconSize: "14px",
  color: "var(--muted-foreground)",
} as const;

// TODO: 通知APIが用意されたら、このサンプルデータを取得結果に差し替える。
const sampleUnreadNotifications: UnreadNotification[] = [
  {
    id: "sample-unread-notification-1",
    title: "Project wiki updated",
    body: "Requirements notes were added to the ManageMe MVP wiki.",
    time: "10 min ago",
  },
  {
    id: "sample-unread-notification-2",
    title: "Task deadline approaching",
    body: "Header implementation review is due today.",
    time: "1 hour ago",
  },
  {
    id: "sample-unread-notification-3",
    title: "New task comment",
    body: "A pending Bell Marks item was marked ready for implementation.",
    time: "Yesterday",
  },
  {
    id: "sample-unread-notification-3",
    title: "New task comment",
    body: "A pending Bell Marks item was marked ready for implementation.",
    time: "Yesterday",
  },
  {
    id: "sample-unread-notification-3",
    title: "New task comment",
    body: "A pending Bell Marks item was marked ready for implementation.",
    time: "Yesterday",
  },
];

export function AppHeader({ onNavigate }: AppHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-40 flex h-[48px] items-center justify-between
        gap-[8px] border-b bg-background px-[8px] text-foreground md:px-[20px]"
    >
      <div className="flex min-w-0 shrink-0 items-center gap-[4px]">
        <h1 className="my-[0px] truncate text-[20px] font-semibold">ManageMe</h1>
      </div>

      <HeaderSearchForm />

      <div className="flex shrink-0 items-center gap-[8px]">
        <NotificationBell notifications={sampleUnreadNotifications} />
        <SettingsButton onNavigate={onNavigate} />
      </div>
    </header>
  );
}

// ================================================================
// ■ ヘッダー検索フォーム

function HeaderSearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trimmedSearchQuery = searchQuery.trim();
  const searchClearButtonVars = {
    "--header-search-clear-button-size": searchClearButtonStyle.buttonSize,
    "--header-search-clear-icon-size": searchClearButtonStyle.iconSize,
    "--header-search-clear-color": searchClearButtonStyle.color,
  } as CSSProperties;
  // 入力中の文字列だけでサンプル候補を絞り込み、Issue #8 の範囲に検索結果画面の実装を混ぜない。
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
        <SearchSuggestions
          onSelectSuggestion={(title) => {
            setSearchQuery(title);
            setIsSearchFocused(false);
          }}
          suggestions={visibleSuggestions}
        />
      )}
    </form>
  );
}

// ================================================================
// ■ 検索候補

type SearchSuggestion = (typeof searchSuggestions)[number];

type SearchSuggestionsProps = {
  suggestions: SearchSuggestion[];
  onSelectSuggestion: (title: string) => void;
};

function SearchSuggestions({
  suggestions,
  onSelectSuggestion,
}: SearchSuggestionsProps) {
  return (
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
      {suggestions.length > 0 ? (
        suggestions.map((suggestion) => {
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
                onSelectSuggestion(suggestion.title);
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
  );
}

// ================================================================
// ■ 通知ベル

type NotificationBellProps = {
  notifications: UnreadNotification[];
};

function NotificationBell({ notifications }: NotificationBellProps) {
  const unreadNotificationCount = notifications.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={`Notifications (${unreadNotificationCount} unread)`}
          className="
            relative border-0 bg-transparent text-foreground rounded-full w-[40px] h-[40px]
            hover:bg-muted hover:text-foreground
            dark:bg-transparent dark:hover:bg-muted
          "
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="size-4 text-current" />
          {unreadNotificationCount > 0 && (
            <UnreadNotificationBadge count={unreadNotificationCount} />
          )}
        </Button>
      </DialogTrigger>
      <NotificationDialogContent
        notifications={notifications}
      />
    </Dialog>
  );
}

type UnreadNotificationBadgeProps = {
  count: number;
};

function UnreadNotificationBadge({ count }: UnreadNotificationBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className="
        absolute right-[-1px] top-[0px] grid min-w-[18px] h-[18px]
        place-items-center rounded-full border-2 border-background
        bg-destructive text-[10px] font-semibold leading-none text-white
        dark:border-background
      "
    >
      {count}
    </span>
  );
}

type NotificationDialogContentProps = {
  notifications: UnreadNotification[];
};

function NotificationDialogContent({
  notifications
}: NotificationDialogContentProps) {
  return (
    <DialogContent
      className="
        left-auto right-[16px] top-[52px] w-[360px] max-w-[360px]
        translate-x-0 translate-y-0 md:right-[28px] pt-[4px] pb-[12px]
        rounded-xl
        text-foreground dark:bg-popover-2
      "
      showCloseButton={false}
    >
      <DialogHeader className="pl-[12px] pr-[44px] border-b">
        <DialogTitle className="text-[16px] my-[8px] text-left">Unread notifications</DialogTitle>
        {/* <DialogDescription>
          {unreadNotificationCount} unread sample notifications
        </DialogDescription> */}
      </DialogHeader>
      {/* 未読通知の一覧だけをここに閉じ込め、ベルボタン側の責務を開閉操作に限定する。 */}
      <div className="notification-scrollbar grid max-h-[480px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            className="
              grid gap-[3px] border-0 bg-background px-[12px] py-[8px]
              text-foreground dark:bg-popover-2
            "
            key={notification.id}
          >
            <div className="flex min-w-0 items-start justify-between gap-[8px]">
              <span className="min-w-0 text-xs font-semibold">
                {notification.title}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {notification.time}
              </span>
            </div>
            <p className="m-0 text-xs leading-relaxed text-muted-foreground">
              {notification.body}
            </p>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}

// ================================================================
// ■ 設定ボタン

type SettingsButtonProps = {
  onNavigate: (page: PageKey) => void;
};

function SettingsButton({ onNavigate }: SettingsButtonProps) {
  return (
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
  );
}
