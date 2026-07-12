import { memo, useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";

type SearchPageProps = {
  initialQuery?: string;
  onSearch: (query: string) => void;
};

export function SearchPage({ initialQuery = "", onSearch }: SearchPageProps) {
  return (
    <PageShell breadcrumbs={[{ label: "Search" }]}>
      <div className="flex min-h-0 flex-col overflow-y-auto px-[8px] py-[24px]">
        <SearchHero initialQuery={initialQuery} onSearch={onSearch} />
      </div>
    </PageShell>
  );
}

type SearchHeroProps = {
  initialQuery: string;
  onSearch: (query: string) => void;
};

const SearchHero = memo(function SearchHero({
  initialQuery,
  onSearch,
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
            キーワードを入力して、IssueやDocumentをすばやく見つけます。
          </p>
        </div>
      </div>

      <SearchBox initialQuery={initialQuery} onSearch={onSearch} />
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

        if (!trimmedQuery) {
          return;
        }

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
        placeholder="Issue、Document、キーワードを検索"
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
