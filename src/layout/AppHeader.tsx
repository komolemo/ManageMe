import { useState, type MouseEvent } from "react";
import { Bell, Clock3, Ellipsis, FileText, ListTodo } from "lucide-react";

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
import type { SearchSuggestion } from "@/features/search/types";
import { useSearchSuggestions } from "@/features/search/useSearchSuggestions";
import manageMeLogo from "@/img/ManageMe_logo.png";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";

export type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onOpenSearchDocument: (documentId: string) => void;
  onOpenSearchTask: (taskId: string) => void;
  onSearch: (query: string) => void;
  showSearchSuggestions?: boolean;
  workspaceId?: string;
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
    title: "Project document updated",
    body: "Requirements notes were added to the ManageMe MVP document.",
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

type AppHeaderLeftProps = Pick<AppHeaderProps, "onNavigate">;

export function AppHeaderLeft({ onNavigate }: AppHeaderLeftProps) {
  return (
    <div
      className="flex min-w-0 items-center pl-2"
      data-tauri-drag-region
    >
      <button
        aria-label="ManageMe"
        className="flex cursor-pointer items-center gap-2 truncate border-0 bg-transparent p-0 text-xl font-semibold text-foreground"
        onClick={() => onNavigate("top")}
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-6 shrink-0 object-contain"
          src={manageMeLogo}
        />
        <span className="hidden md:inline">ManageMe</span>
      </button>
    </div>
  );
}

type AppHeaderSearchProps = Pick<
  AppHeaderProps,
  | "onOpenSearchDocument"
  | "onOpenSearchTask"
  | "onSearch"
  | "showSearchSuggestions"
  | "workspaceId"
>;

export function AppHeaderSearch({
  onOpenSearchDocument,
  onOpenSearchTask,
  onSearch,
  showSearchSuggestions = true,
  workspaceId,
}: AppHeaderSearchProps) {
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const suggestions = useSearchSuggestions(suggestionQuery, workspaceId);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === "document") {
      onOpenSearchDocument(suggestion.id);
    } else if (suggestion.kind === "task") {
      onOpenSearchTask(suggestion.id);
    } else {
      onSearch(suggestion.label);
    }
  };

  return (
    <SearchSuggestionForm
      className="h-[32px] min-w-0 w-full"
      inputId="header-search"
      onQueryChange={setSuggestionQuery}
      onSearch={onSearch}
      showSuggestions={showSearchSuggestions}
      suggestion={{
        getKey: (suggestion) => `${suggestion.kind}:${suggestion.id}`,
        getValue: (suggestion) => suggestion.label,
        items: suggestions,
        maxItems: 10,
        onSelect: selectSuggestion,
        renderItem: (suggestion) => (
          <HeaderSearchSuggestion suggestion={suggestion} />
        ),
      }}
    />
  );
}

type AppHeaderActionsProps = Pick<
  AppHeaderProps,
  "onNavigate" | "onOpenInNewTab"
>;

export function AppHeaderActions({
  onNavigate,
  onOpenInNewTab,
}: AppHeaderActionsProps) {
  return (
    <>
      <NotificationBell notifications={sampleUnreadNotifications} />
      <SettingsButton
        onNavigate={onNavigate}
        onOpenInNewTab={onOpenInNewTab}
      />
    </>
  );
}

type HeaderSearchSuggestionProps = {
  suggestion: SearchSuggestion;
};

function HeaderSearchSuggestion({ suggestion }: HeaderSearchSuggestionProps) {
  const SuggestionIcon =
    suggestion.kind === "document"
      ? FileText
      : suggestion.kind === "task"
        ? ListTodo
        : Clock3;

  return (
    <>
      <span className="flex min-w-0 items-center gap-[8px]">
        <span
          className="
            grid size-[24px] shrink-0 place-items-center border-0 bg-transparent
            text-muted-foreground dark:text-foreground
          "
        >
          <SuggestionIcon className="size-5 text-current" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          {suggestion.label}
        </span>
        <Badge className="h-[20px] shrink-0 border-0" variant="outline">
          {suggestion.kind}
        </Badge>
      </span>
      {suggestion.workspaceId ? (
        <span className="truncate text-xs text-muted-foreground">
          {suggestion.workspaceId}
        </span>
      ) : null}
    </>
  );
}

type NotificationBellProps = {
  notifications: UnreadNotification[];
};

function NotificationBell({ notifications }: NotificationBellProps) {
  const { t } = useTranslation();
  const unreadNotificationCount = notifications.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={t("header.notificationsUnread", { count: unreadNotificationCount })}
          className="
            relative border-0 bg-transparent text-foreground rounded-full w-[40px] h-[40px]
            hover:bg-muted hover:text-foreground
            dark:bg-transparent dark:hover:bg-muted
          "
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="size-6 text-current" />
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
        place-items-center rounded-full border-2 border-header
        bg-destructive text-[10px] font-semibold leading-none text-white
        dark:border-header
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
  const { t } = useTranslation();
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
          {t("header.unreadNotifications")}
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
  onOpenInNewTab: (page: PageKey) => void;
};

function SettingsButton({
  onNavigate,
  onOpenInNewTab,
}: SettingsButtonProps) {
  const { t } = useTranslation();
  const openSettingsInNewTab = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("settings");
  };

  return (
    <Button
      aria-label={t("header.settings")}
      className="
        border-0  bg-transparent text-foreground rounded-full w-[40px] h-[40px]
        hover:bg-muted hover:text-foreground
        dark:bg-transparent dark:hover:bg-muted
      "
      onClick={() => onNavigate("settings")}
      onAuxClick={openSettingsInNewTab}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      <Ellipsis className="size-6 text-current" />
    </Button>
  );
}
