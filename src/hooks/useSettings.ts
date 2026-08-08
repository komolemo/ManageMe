import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLanguage = "system" | "en" | "ja";
export type ProjectGrouping = "progress" | "bucket";
export type ProjectViewMode = "grid" | "board";
export type Theme = "light" | "dark";

type ValueUpdater<T> = T | ((currentValue: T) => T);

type SettingsValues = {
  theme: Theme;
  language: AppLanguage;
  projectGrouping: ProjectGrouping;
  projectViewMode: ProjectViewMode;
  isAppSidebarOpen: boolean;
  isDetailSidebarOpen: boolean;
  isLibraryOpen: boolean;
  isProjectListOpen: boolean;
};

type SettingsState = SettingsValues & {
  setTheme: (value: ValueUpdater<Theme>) => void;
  setLanguage: (value: ValueUpdater<AppLanguage>) => void;
  setProjectGrouping: (value: ValueUpdater<ProjectGrouping>) => void;
  setProjectViewMode: (value: ValueUpdater<ProjectViewMode>) => void;
  setIsAppSidebarOpen: (value: ValueUpdater<boolean>) => void;
  setIsDetailSidebarOpen: (value: ValueUpdater<boolean>) => void;
  setIsLibraryOpen: (value: ValueUpdater<boolean>) => void;
  setIsProjectListOpen: (value: ValueUpdater<boolean>) => void;
};

export const settingsStorageKey = "manage-me:settings";

function storedBoolean(key: string, fallback: boolean) {
  const value = window.localStorage.getItem(key);
  return value === null ? fallback : value === "true";
}

function initialSettings(): SettingsValues {
  const savedTheme = window.localStorage.getItem("manage-me-theme");
  const savedLanguage = window.localStorage.getItem("manage-me:language");

  return {
    theme: savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" as const
        : "light" as const,
    language: savedLanguage === "en" || savedLanguage === "ja" || savedLanguage === "system"
      ? savedLanguage
      : "system" as const,
    projectGrouping: "progress" as const,
    projectViewMode: "grid" as const,
    isAppSidebarOpen: storedBoolean("manage-me:app-sidebar-open", true),
    isDetailSidebarOpen: storedBoolean("manage-me:detail-sidebar-open", true),
    isLibraryOpen: storedBoolean("manage-me:app-sidebar-document-open", true),
    isProjectListOpen: storedBoolean("manage-me:app-sidebar-projects-open", true),
  };
}

function resolveValue<T>(value: ValueUpdater<T>, currentValue: T) {
  return typeof value === "function"
    ? (value as (currentValue: T) => T)(currentValue)
    : value;
}

const defaults = initialSettings();

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setTheme: (value) => set((state) => ({ theme: resolveValue(value, state.theme) })),
      setLanguage: (value) => set((state) => ({ language: resolveValue(value, state.language) })),
      setProjectGrouping: (value) => set((state) => ({ projectGrouping: resolveValue(value, state.projectGrouping) })),
      setProjectViewMode: (value) => set((state) => ({ projectViewMode: resolveValue(value, state.projectViewMode) })),
      setIsAppSidebarOpen: (value) => set((state) => ({ isAppSidebarOpen: resolveValue(value, state.isAppSidebarOpen) })),
      setIsDetailSidebarOpen: (value) => set((state) => ({ isDetailSidebarOpen: resolveValue(value, state.isDetailSidebarOpen) })),
      setIsLibraryOpen: (value) => set((state) => ({ isLibraryOpen: resolveValue(value, state.isLibraryOpen) })),
      setIsProjectListOpen: (value) => set((state) => ({ isProjectListOpen: resolveValue(value, state.isProjectListOpen) })),
    }),
    {
      name: settingsStorageKey,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        projectGrouping: state.projectGrouping,
        projectViewMode: state.projectViewMode,
        isAppSidebarOpen: state.isAppSidebarOpen,
        isDetailSidebarOpen: state.isDetailSidebarOpen,
        isLibraryOpen: state.isLibraryOpen,
        isProjectListOpen: state.isProjectListOpen,
      }),
    },
  ),
);
