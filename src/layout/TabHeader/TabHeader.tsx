import { AIChatToggle } from "@/layout/AIChat";
import { AppHeaderSearch } from "@/layout/AppHeader/AppHeaderSearch";
import { useAIChat } from "@/layout/AIChatContext";
import { useAppSearch } from "@/layout/AppSearchContext";
import { TabPageHistoryControls } from "@/layout/TabHeader/TabPageHistoryControls";

export function TabHeader() {
  const appSearch = useAppSearch();
  const aiChat = useAIChat();

  return (
    <div className="relative z-10 my-1 grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] items-center bg-card px-1 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center overflow-hidden">
        <TabPageHistoryControls />
      </div>
      {appSearch ? (
        <AppHeaderSearch
          className="col-start-2 row-start-1 h-8 w-full min-w-0 max-w-[20rem] justify-self-center md:max-w-[28rem] lg:max-w-[36rem] xl:max-w-[42rem]"
          onOpenSearchDocument={appSearch.onOpenSearchDocument}
          onOpenSearchTask={appSearch.onOpenSearchTask}
          onSearch={appSearch.onSearch}
          showSearchSuggestions={appSearch.showSearchSuggestions}
        />
      ) : (
        <div />
      )}
      <div className="flex justify-self-end gap-2">
        {aiChat ? (
          <AIChatToggle
            isOpen={aiChat.isOpen}
            onToggle={aiChat.onToggle}
          />
        ) : null}
      </div>
    </div>
  );
}
