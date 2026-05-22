import { useEffect, useMemo, useState } from "react";
import { FileText, FolderKanban, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  searchSuggestions,
  type SearchSuggestionKind,
} from "@/components/layout/searchSuggestions";
import { PageShell } from "@/pages/PageShell";

type SearchPageProps = {
  initialQuery?: string;
};

type SearchScope = "all" | SearchSuggestionKind;

const searchScopes: { label: string; value: SearchScope }[] = [
  { label: "All", value: "all" },
  { label: "Projects", value: "project" },
  { label: "Wiki", value: "wiki" },
];

export function SearchPage({ initialQuery = "" }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const [scope, setScope] = useState<SearchScope>("all");

  useEffect(() => {
    setQuery(initialQuery);
    setSubmittedQuery(initialQuery.trim());
  }, [initialQuery]);

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
      badge="Common / Search"
      title="Search"
      description="Find projects and wiki pages from the current workspace."
    >
      <div className="grid gap-[16px]">
        <form
          className="grid gap-[12px] border-b pb-[16px] md:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedQuery(query.trim());
          }}
        >
          <label className="sr-only" htmlFor="search-page-query">
            Search query
          </label>
          <Input
            id="search-page-query"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects and wiki pages"
            type="search"
            value={query}
          />
          <Button className="gap-[8px]" disabled={!query.trim()} type="submit">
            <Search className="size-4" />
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-[8px]" role="tablist" aria-label="Search scope">
          {searchScopes.map((searchScope) => (
            <Button
              aria-selected={scope === searchScope.value}
              className="h-[32px]"
              key={searchScope.value}
              onClick={() => setScope(searchScope.value)}
              role="tab"
              size="sm"
              type="button"
              variant={scope === searchScope.value ? "default" : "outline"}
            >
              {searchScope.label}
            </Button>
          ))}
        </div>

        <section className="grid gap-[8px]" aria-label="Search results">
          {submittedQuery ? (
            <div className="flex items-center justify-between gap-[12px] text-xs text-muted-foreground">
              <span>
                {results.length} result{results.length === 1 ? "" : "s"} for "{submittedQuery}"
              </span>
              <span>{scope === "all" ? "All scopes" : scope === "project" ? "Projects" : "Wiki"}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Enter a keyword to search projects and wiki pages.
            </div>
          )}

          {results.map((result) => {
            const ResultIcon = result.kind === "project" ? FolderKanban : FileText;

            return (
              <Card className="border-t ring-0" key={result.id}>
                <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-[10px]">
                  <span className="grid size-[32px] place-items-center border text-muted-foreground">
                    <ResultIcon className="size-4" />
                  </span>
                  <CardTitle className="min-w-0 truncate">{result.title}</CardTitle>
                  <Badge variant="outline">{result.scope}</Badge>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {result.excerpt}
                </CardContent>
              </Card>
            );
          })}

          {submittedQuery && results.length === 0 && (
            <div className="border px-[12px] py-[16px] text-xs text-muted-foreground">
              No matching projects or wiki pages found.
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
