import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type UnreadNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

export const sampleUnreadNotifications: UnreadNotification[] = [
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

export type NotificationBellProps = {
  notifications: UnreadNotification[];
};

export function NotificationBell({ notifications }: NotificationBellProps) {
  const { t } = useTranslation();
  const unreadNotificationCount = notifications.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={t("header.notificationsUnread", {
            count: unreadNotificationCount,
          })}
          className="
            relative border-0 bg-transparent text-foreground rounded-full w-8 h-8
            hover:bg-muted hover:text-foreground
            dark:bg-transparent dark:hover:bg-muted
          "
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="size-5 text-current" />
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
