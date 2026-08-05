import { useEffect, useMemo, useState } from "react";
import { FileText, ListTodo, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/pages/PageShell";
import { useTranslation } from "react-i18next";
import { searchApi } from "@/features/search/searchApi";
import type { SearchResultItem } from "@/features/search/types";

type SearchResultType = "task" | "document";
type SearchResultFilter = "all" | SearchResultType;

const resultTypeConfig: Record<
  SearchResultType,
  {
    Icon: LucideIcon;
    labelKey: string;
  }
> = {
  task: {
    Icon: ListTodo,
    labelKey: "search.issue",
  },
  document: {
    Icon: FileText,
    labelKey: "search.document",
  },
};

const searchResultFilters: {
  labelKey: string;
  type: SearchResultFilter;
}[] = [
  {
    labelKey: "search.all",
    type: "all",
  },
  {
    labelKey: "search.issues",
    type: "task",
  },
  {
    labelKey: "search.document",
    type: "document",
  },
];

type SearchResultProps = {
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  query?: string;
};

export function SearchResult({
  onOpenDocument,
  onOpenTask,
  query = "",
}: SearchResultProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<SearchResultFilter>("all");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchQuery = query.trim();

  useEffect(() => {
    let isCurrent = true;
    setSearchError(null);
    setSearchResults([]);
    if (!searchQuery) {
      return () => { isCurrent = false; };
    }
    void searchApi.search(searchQuery).then((results) => {
      if (isCurrent) setSearchResults(results);
    }).catch((error: unknown) => {
      if (isCurrent) {
        setSearchResults([]);
        setSearchError(String(error));
      }
    });
    return () => { isCurrent = false; };
  }, [searchQuery]);

  const filteredResults = useMemo(() => {
    if (activeFilter === "all") {
      return searchResults;
    }

    return searchResults.filter((result) => result.kind === activeFilter);
  }, [activeFilter, searchResults]);

  return (
    <PageShell breadcrumbs={[{ label: t("pages.search") }, { label: t("pages.results") }]}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="mb-[12px] flex shrink-0 flex-wrap items-center gap-[8px]">
          {searchResultFilters.map((filter) => {
            const isActive = filter.type === activeFilter;

            return (
              <Button
                aria-pressed={isActive}
                className="rounded-full px-[14px] py-[4px]"
                key={filter.type}
                onClick={() => setActiveFilter(filter.type)}
                size="sm"
                type="button"
                variant={isActive ? "default" : "outline"}
              >
                {t(filter.labelKey)}
              </Button>
            );
          })}
        </div>

        <div className="mb-[12px] flex shrink-0 items-center justify-start gap-[12px] border-b pb-[12px] text-xs text-muted-foreground">
          <span>
            {searchQuery
              ? t("search.matchedResults", { query: searchQuery })
              : t("search.resultTitle")}
          </span>
          <span>{t("search.resultCount", { count: filteredResults.length })}</span>
        </div>

        <div className="hover-scrollbar-y grid min-h-0 gap-[0px] overflow-y-auto pr-[4px]">
          {searchError ? (
            <p className="text-sm text-destructive">{searchError}</p>
          ) : null}
          {filteredResults.map((result) => (
            <SearchResultCard
              key={result.id}
              onOpenDocument={onOpenDocument}
              onOpenTask={onOpenTask}
              result={result}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

type SearchResultCardProps = {
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  result: SearchResultItem;
};

function SearchResultCard({
  onOpenDocument,
  onOpenTask,
  result,
}: SearchResultCardProps) {
  const { t } = useTranslation();
  const { Icon, labelKey } = resultTypeConfig[result.kind];
  const label = t(labelKey);

  return (
    <button
      className="grid grid-cols-[auto_1fr] gap-[12px] border-0 border-b bg-background px-[14px] py-[12px] text-left hover:bg-muted"
      onClick={() => {
        if (result.kind === "document") {
          onOpenDocument(result.id);
        } else {
          onOpenTask(result.id);
        }
      }}
      type="button"
    >
      <div className="grid size-[36px] shrink-0 place-items-center self-center rounded-md border-0 bg-transparent text-muted-foreground">
        <Icon className="size-[36px]" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </div>

      <div className="grid min-w-0 gap-[6px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          {/* <span className="shrink-0 rounded-sm border px-[6px] py-[2px] text-[10px] font-semibold uppercase leading-none text-muted-foreground">
            {label}
          </span> */}
          <h3 className="my-[4px] min-w-0 truncate text-sm font-semibold text-foreground">
            {result.title}
          </h3>
        </div>

        <p className="my-[2px] truncate text-[12px] text-muted-foreground">
          {result.path}
        </p>
        <p className="my-[2px] line-clamp-2 text-[14px] leading-relaxed text-foreground/80">
          {result.description}
        </p>
      </div>
    </button>
  );
}
