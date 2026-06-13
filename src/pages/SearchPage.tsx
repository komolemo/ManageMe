import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FileText, FolderKanban, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchSuggestions,
  type SearchSuggestion,
  type SearchSuggestionKind,
} from "@/layout/searchSuggestions";
import { PageShell } from "@/pages/PageShell";

type SearchPageProps = {
  initialQuery?: string;
};

type SearchScope = "all" | SearchSuggestionKind;

const searchScopes: { label: string; value: SearchScope }[] = [
  { label: "すべて", value: "all" },
  { label: "プロジェクト", value: "project" },
  { label: "Wiki", value: "wiki" },
];

export function SearchPage({ initialQuery = "" }: SearchPageProps) {
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const [scope, setScope] = useState<SearchScope>("all");

  useEffect(() => {
    setSubmittedQuery(initialQuery.trim());
  }, [initialQuery]);

  const handleSearch = useCallback((nextQuery: string) => {
    setSubmittedQuery(nextQuery.trim());
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = submittedQuery.toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchSuggestions.filter((suggestion) => {
      if (scope !== "all" && suggestion.kind !== scope) {
        return false;
      }

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
    });
  }, [scope, submittedQuery]);

  return (
    <PageShell
      badge=""
      title=""
      description=""
    >
      <div className="fle min-h-0 flex-col overflow-y-auto px-[8px] py-[24px]">
        <SearchHero
          initialQuery={initialQuery}
          onSearch={handleSearch}
          onScopeChange={setScope}
          scope={scope}
        />
        <SearchResults
          results={results}
          scope={scope}
          submittedQuery={submittedQuery}
        />
      </div>
    </PageShell>
  );
}

type SearchHeroProps = {
  initialQuery: string;
  onSearch: (query: string) => void;
  onScopeChange: (scope: SearchScope) => void;
  scope: SearchScope;
};

const SearchHero = memo(function SearchHero({
  initialQuery,
  onSearch,
  onScopeChange,
  scope,
}: SearchHeroProps) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center gap-[24px] text-center">
      <div className="grid gap-[12px]">
        <div className="mx-auto grid size-[52px] place-items-center rounded-full border bg-background shadow-sm shadow-foreground/5">
          <Sparkles className="size-5 text-foreground" aria-hidden="true" />
        </div>
        <div className="grid gap-[8px]">
          <h2 className="text-[28px] font-semibold tracking-normal text-foreground md:text-[34px]">
            何を探しますか？
          </h2>
          <p className="text-sm text-muted-foreground">
            キーワードを入力して、プロジェクトやWikiをすばやく見つけます。
          </p>
        </div>
      </div>

      <SearchBox initialQuery={initialQuery} onSearch={onSearch} />

      <div
        className="flex flex-wrap justify-center gap-[8px]"
        role="tablist"
        aria-label="検索対象"
      >
        {searchScopes.map((searchScope) => (
          <Button
            aria-selected={scope === searchScope.value}
            className="h-[32px] rounded-full px-[14px]"
            key={searchScope.value}
            onClick={() => onScopeChange(searchScope.value)}
            role="tab"
            size="sm"
            type="button"
            variant={scope === searchScope.value ? "default" : "outline"}
          >
            {searchScope.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

type SearchBoxProps = {
  initialQuery: string;
  onSearch: (query: string) => void;
};

const SearchBox = memo(function SearchBox({
  initialQuery,
  onSearch,
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const trimmedQuery = query.trim();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <form
      className="flex w-full max-w-[640px] items-center gap-[8px] rounded-full border bg-background px-[16px] py-[8px] shadow-sm shadow-foreground/10 focus-within:ring-1 focus-within:ring-ring/50"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(trimmedQuery);
      }}
    >
      <Search
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <label className="sr-only" htmlFor="search-page-query">
        検索キーワード
      </label>
      <Input
        id="search-page-query"
        className="h-[40px] border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:bg-transparent"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="プロジェクト名、Wiki、キーワードを検索"
        type="search"
        value={query}
      />
      <Button
        className="rounded-full px-[16px]"
        disabled={!trimmedQuery}
        type="submit"
      >
        検索
      </Button>
    </form>
  );
});

type SearchResultsProps = {
  results: SearchSuggestion[];
  scope: SearchScope;
  submittedQuery: string;
};

const SearchResults = memo(function SearchResults({
  results,
  scope,
  submittedQuery,
}: SearchResultsProps) {
  return (
    <section
      className="mx-auto mt-[28px] grid w-full max-w-[760px] gap-[10px]"
      aria-label="検索結果"
    >
      {submittedQuery ? (
        <div className="flex flex-wrap items-center justify-between gap-[12px] text-xs text-muted-foreground">
          <span>
            「{submittedQuery}」の検索結果: {results.length}件
          </span>
          <span>
            対象:{" "}
            {scope === "all"
              ? "すべて"
              : scope === "project"
                ? "プロジェクト"
                : "Wiki"}
          </span>
        </div>
      ) : (
        <div className="text-center text-xs text-muted-foreground">
          検索したい言葉を入力してください。
        </div>
      )}

      {results.map((result) => {
        const ResultIcon = result.kind === "project" ? FolderKanban : FileText;

        return (
          <article
            className="grid gap-[8px] rounded-lg border bg-background px-[14px] py-[12px] text-left shadow-sm shadow-foreground/5"
            key={result.id}
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[10px]">
              <span className="grid size-[34px] place-items-center rounded-full bg-muted text-muted-foreground">
                <ResultIcon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="min-w-0 truncate text-sm font-medium">
                {result.title}
              </h3>
              <Badge className="rounded-full" variant="outline">
                {result.kind === "project" ? "プロジェクト" : "Wiki"}
              </Badge>
            </div>
            <p className="pl-[44px] text-xs text-muted-foreground">
              {result.excerpt}
            </p>
          </article>
        );
      })}

      {submittedQuery && results.length === 0 && (
        <div className="rounded-lg border bg-background px-[14px] py-[18px] text-center text-xs text-muted-foreground">
          一致するプロジェクトやWikiは見つかりませんでした。
        </div>
      )}
    </section>
  );
});
