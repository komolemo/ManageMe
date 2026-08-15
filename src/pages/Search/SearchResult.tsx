import { useEffect, useMemo, useState } from "react";
import { FileText, ListTodo, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      <div className="flex h-full min-h-0 flex-col px-0 overflow-hidden overflow-y-auto hover-scrollbar-y ">
        <div className="mb-[12px] flex shrink-0 flex-wrap px-[128px] items-center gap-[8px]">
          {searchResultFilters.map((filter) => {
            const isActive = filter.type === activeFilter;

            return (
              <Button
                aria-pressed={isActive}
                className="rounded-full px-[14px] py-1"
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

        <div className="flex shrink-0 items-center justify-start gap-3 px-[128px] pb-1 text-xs text-muted-foreground">
          <span>
            {searchQuery
              ? t("search.matchedResults", { query: searchQuery })
              : t("search.resultTitle")}
          </span>
          <span>{t("search.resultCount", { count: filteredResults.length })}</span>
        </div>

        <Separator/>

        <div className="grid min-h-0 auto-rows-max content-start gap-[0px] px-[128px]">
          {searchError ? (
            <p className="text-sm text-destructive">{searchError}</p>
          ) : null}
          {filteredResults.map((result) => (
            <SearchResultCard
              key={result.id}
              onOpenDocument={onOpenDocument}
              onOpenTask={onOpenTask}
              query={searchQuery}
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
  query: string;
  result: SearchResultItem;
};

function HighlightedText({ query, text }: { query: string; text: string }) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return parts.map((part, index) =>
    part.toLocaleLowerCase() === normalizedQuery.toLocaleLowerCase() ? (
      <mark
        className="rounded-sm bg-yellow-200 px-[2px] text-foreground dark:bg-yellow-700"
        key={`${part}-${index}`}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function SearchResultCard({
  onOpenDocument,
  onOpenTask,
  query,
  result,
}: SearchResultCardProps) {
  const { t } = useTranslation();
  const { Icon, labelKey } = resultTypeConfig[result.kind];
  const label = t(labelKey);
  const workspace = result.path.split(/[\\/>]/, 1)[0]?.trim() || result.path;

  return (
    <Card
      className="grid cursor-pointer grid-cols-[auto_1fr] gap-x-[12px] gap-y-0 border-0 border-b py-[12px] text-left ring-0 hover:bg-muted"
      onClick={() => {
        if (result.kind === "document") {
          onOpenDocument(result.id);
        } else {
          onOpenTask(result.id);
        }
      }}
    >
      <CardHeader className="col-span-2 grid grid-cols-[auto_1fr] gap-x-[12px] gap-y-0 px-0">
        <div className="row-span-2 grid shrink-0 place-items-center self-center rounded-md border-0 bg-transparent text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </div>

        <p className="min-w-0 truncate text-sm font-medium text-foreground">
          {workspace}
        </p>
        <p className="min-w-0 truncate text-xs text-foreground/80">
          {result.path}
        </p>
      </CardHeader>

      <h3 className="col-span-2 min-w-0 mt-[3px] pt-[5px] truncate text-[22px] leading-[28px] font-bold text-foreground">
        {result.title}
      </h3>
      <p className="col-span-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        <HighlightedText query={query} text={result.description} />
      </p>
    </Card>
  );
}
