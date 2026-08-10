import { AppHeaderLogo } from "@/layout/AppHeader/AppHeaderLogo";
import {
  NotificationBell,
  sampleUnreadNotifications,
} from "@/layout/AppHeader/AppHeaderNotification";
import { AppHeaderSearch } from "@/layout/AppHeader/AppHeaderSearch";
import type { PageKey } from "@/pages/pageTypes";
import { SettingsButton } from "@/layout/AppHeader/AppHeaderSettingsButton";

export type AppHeaderProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onOpenSearchDocument: (documentId: string) => void;
  onOpenSearchTask: (taskId: string) => void;
  onSearch: (query: string) => void;
  showSearchSuggestions?: boolean;
  workspaceId?: string;
};

export function AppHeader(props: AppHeaderProps) {
  return (
    <>
      <AppHeaderLogo onNavigate={props.onNavigate} />
      <AppHeaderSearch
        onOpenSearchDocument={props.onOpenSearchDocument}
        onOpenSearchTask={props.onOpenSearchTask}
        onSearch={props.onSearch}
        showSearchSuggestions={props.showSearchSuggestions}
        workspaceId={props.workspaceId}
      />
      <div className="col-start-3 row-start-1 mr-40 flex h-full min-w-0 items-center justify-end gap-2">
        <NotificationBell notifications={sampleUnreadNotifications} />
        <SettingsButton
          onNavigate={props.onNavigate}
          onOpenInNewTab={props.onOpenInNewTab}
        />
      </div>
    </>
  );
}
