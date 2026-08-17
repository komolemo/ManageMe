import { memo, useState } from "react";
import { Clock3, FileText, ListTodo, Sparkles } from "lucide-react";

import { SearchSuggestionForm } from "@/components/app/SearchSuggestionForm";
import type { SearchSuggestion } from "@/features/search/types";
import { useSearchSuggestions } from "@/features/search/useSearchSuggestions";
import { PageShell } from "@/layout/PageShell/PageShell";
import { useTranslation } from "react-i18next";

type SearchPageProps = {
  initialQuery?: string;
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSearch: (query: string) => void;
};

export function SearchPage({
  initialQuery = "",
  onOpenDocument,
  onOpenTask,
  onSearch,
}: SearchPageProps) {
  const { t } = useTranslation();
  return (
    <PageShell breadcrumbs={[{ label: t("pages.search") }]}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-[8px] pb-[24px]">
        <SearchHero
          initialQuery={initialQuery}
          onOpenDocument={onOpenDocument}
          onOpenTask={onOpenTask}
          onSearch={onSearch}
        />
      </div>
    </PageShell>
  );
}

type SearchHeroProps = {
  initialQuery: string;
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSearch: (query: string) => void;
};

const SearchHero = memo(function SearchHero({
  initialQuery,
  onOpenDocument,
  onOpenTask,
  onSearch,
}: SearchHeroProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-start gap-[24px] text-center">
      <div className="grid gap-[12px]">
        <div className="mx-auto grid size-[52px] place-items-center rounded-full border bg-background shadow-sm shadow-foreground/5">
          <Sparkles className="size-5 text-foreground" aria-hidden="true" />
        </div>
        <div className="grid gap-[8px]">
          <h2 className="text-[28px] font-semibold tracking-normal text-foreground md:text-[34px]">
            {t("search.prompt")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("search.help")}
          </p>
        </div>
      </div>

      <SearchBox
        initialQuery={initialQuery}
        onOpenDocument={onOpenDocument}
        onOpenTask={onOpenTask}
        onSearch={onSearch}
      />
    </div>
  );
});

type SearchBoxProps = {
  initialQuery: string;
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSearch: (query: string) => void;
};

const SearchBox = memo(function SearchBox({
  initialQuery,
  onOpenDocument,
  onOpenTask,
  onSearch,
}: SearchBoxProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const suggestions = useSearchSuggestions(query);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === "document") {
      onOpenDocument(suggestion.id);
    } else if (suggestion.kind === "task") {
      onOpenTask(suggestion.id);
    } else {
      onSearch(suggestion.label);
    }
  };

  return (
    <SearchSuggestionForm
      ariaLabel={t("search.keyword")}
      className="h-[56px] w-full max-w-[640px] shadow-sm shadow-foreground/10"
      inputId="search-page-query"
      initialValue={initialQuery}
      onQueryChange={setQuery}
      onSearch={onSearch}
      placeholder={t("search.placeholder")}
      suggestion={{
        getKey: (suggestion) => `${suggestion.kind}:${suggestion.id}`,
        getValue: (suggestion) => suggestion.label,
        items: suggestions,
        maxItems: 10,
        onSelect: selectSuggestion,
        renderItem: (suggestion) => (
          <SearchPageSuggestion suggestion={suggestion} />
        ),
      }}
    />
  );
});

function SearchPageSuggestion({ suggestion }: { suggestion: SearchSuggestion }) {
  const Icon =
    suggestion.kind === "document"
      ? FileText
      : suggestion.kind === "task"
        ? ListTodo
        : Clock3;

  return (
    <span className="flex min-w-0 items-center gap-[8px]">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm">{suggestion.label}</span>
      <span className="ml-auto text-xs text-muted-foreground">
        {suggestion.kind}
      </span>
    </span>
  );
}
