import { Bell, FileText, FolderKanban, Settings } from "lucide-react";

import { SearchSuggestionForm } from "@/components/app/SearchSuggestionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { searchSuggestions } from "@/layout/searchSuggestions";
import type { PageKey } from "@/pages/pageTypes";

type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
  onSearch: (query: string) => void;
  showSearchSuggestions?: boolean;
};

type UnreadNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

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
    id: "sample-unread-notification-4",
    title: "New task comment",
    body: "A pending Bell Marks item was marked ready for implementation.",
    time: "Yesterday",
  },
  {
    id: "sample-unread-notification-5",
    title: "New task comment",
    body: "A pending Bell Marks item was marked ready for implementation.",
    time: "Yesterday",
  },
];

export function AppHeader({
  onNavigate,
  onSearch,
  showSearchSuggestions = true,
}: AppHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-40 flex h-[48px] items-center justify-between
        gap-[8px] border-b bg-background px-[8px] text-foreground md:px-[20px]"
    >
      <div className="flex min-w-0 shrink-0 items-center gap-[4px]">
        <h1 className="my-[0px] truncate text-[20px] font-semibold">
          ManageMe
        </h1>
      </div>

      <SearchSuggestionForm
        className="max-w-[400px] h-[32px] flex-1"
        inputId="header-search"
        onSearch={onSearch}
        showSuggestions={showSearchSuggestions}
        suggestion={{
          getSearchText: (suggestion) =>
            [
              suggestion.kind,
              suggestion.title,
              suggestion.scope,
              suggestion.excerpt,
              ...suggestion.keywords,
            ].join(" "),
          getValue: (suggestion) => suggestion.title,
          items: searchSuggestions,
          renderItem: (suggestion) => (
            <HeaderSearchSuggestion suggestion={suggestion} />
          ),
        }}
      />

      <div className="flex shrink-0 items-center gap-[8px]">
        <NotificationBell notifications={sampleUnreadNotifications} />
        <SettingsButton onNavigate={onNavigate} />
      </div>
    </header>
  );
}

type SearchSuggestion = (typeof searchSuggestions)[number];

type HeaderSearchSuggestionProps = {
  suggestion: SearchSuggestion;
};

function HeaderSearchSuggestion({ suggestion }: HeaderSearchSuggestionProps) {
  const SuggestionIcon =
    suggestion.kind === "project" ? FolderKanban : FileText;

  return (
    <>
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
    </>
  );
}

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
      <NotificationDialogContent notifications={notifications} />
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
  notifications,
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
        <DialogTitle className="text-[16px] my-[8px] text-left">
          Unread notifications
        </DialogTitle>
      </DialogHeader>
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
