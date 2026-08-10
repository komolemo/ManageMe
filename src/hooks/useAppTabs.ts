import { useEffect, useRef, useState } from "react";
import type { AppTab } from "@/layout/AppLayout";
import type { ProjectTask } from "@/features/task/projectTypes";
import type { PageKey } from "@/pages/pageTypes";

export type NavigationEntry = {
  page: PageKey;
  title: string;
  tagId?: string;
  taskId?: ProjectTask["id"];
  documentId?: string;
  documentTitle?: string;
  searchQuery?: string;
  workspaceId?: string;
};

export type OpenTab = AppTab &
  NavigationEntry & {
    history: NavigationEntry[];
    historyIndex: number;
  };

const initialEntry: NavigationEntry = {
  page: "top",
  title: "TOP",
};

const initialTab: OpenTab = {
  id: "tab-1",
  ...initialEntry,
  history: [initialEntry],
  historyIndex: 0,
};

export function useAppTabs(pageTitles: Record<PageKey, string>) {
  const [tabs, setTabs] = useState<OpenTab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState(initialTab.id);
  const nextTabNumber = useRef(2);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        const history = tab.history.map((entry) =>
          entry.page === "projectDocument" && entry.documentTitle
            ? entry
            : { ...entry, title: pageTitles[entry.page] },
        );
        const currentEntry = history[tab.historyIndex];

        return {
          id: tab.id,
          ...currentEntry,
          history,
          historyIndex: tab.historyIndex,
        };
      }),
    );
  }, [pageTitles]);

  const updateActiveTab = (nextEntry: NavigationEntry) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        const history = [
          ...tab.history.slice(0, tab.historyIndex + 1),
          nextEntry,
        ];

        return {
          id: tab.id,
          ...nextEntry,
          history,
          historyIndex: history.length - 1,
        };
      }),
    );
  };

  const addTab = (nextEntry: NavigationEntry, activateTab = true) => {
    const tab: OpenTab = {
      id: `tab-${nextTabNumber.current}`,
      ...nextEntry,
      history: [nextEntry],
      historyIndex: 0,
    };
    nextTabNumber.current += 1;

    setTabs((currentTabs) => [...currentTabs, tab]);
    if (activateTab) setActiveTabId(tab.id);
  };

  const moveActiveTabHistory = (offset: -1 | 1) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        const historyIndex = tab.historyIndex + offset;
        const entry = tab.history[historyIndex];
        if (!entry) return tab;

        return {
          id: tab.id,
          ...entry,
          history: tab.history,
          historyIndex,
        };
      }),
    );
  };

  const closeTab = (tabId: string) => {
    setTabs((currentTabs) => {
      if (currentTabs.length === 1) return currentTabs;

      const closingTabIndex = currentTabs.findIndex((tab) => tab.id === tabId);
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);

      if (tabId === activeTabId) {
        const nextActiveTab =
          nextTabs[Math.max(0, closingTabIndex - 1)] ?? nextTabs[0];
        setActiveTabId(nextActiveTab.id);
      }

      return nextTabs;
    });
  };

  return {
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    moveActiveTabHistory,
    setActiveTabId,
    tabs,
    updateActiveTab,
  };
}
