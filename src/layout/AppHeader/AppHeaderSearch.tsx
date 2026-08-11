import { useState } from "react";
import { Clock3, FileText, ListTodo } from "lucide-react";

import { SearchSuggestionForm } from "@/components/app/SearchSuggestionForm";
import { Badge } from "@/components/ui/badge";
import type { SearchSuggestion } from "@/features/search/types";
import { useSearchSuggestions } from "@/features/search/useSearchSuggestions";
import type { AppHeaderProps } from "@/layout/AppHeader/AppHeader";

export type AppHeaderSearchProps = Pick<
  AppHeaderProps,
  | "onOpenSearchDocument"
  | "onOpenSearchTask"
  | "onSearch"
  | "showSearchSuggestions"
>;

export function AppHeaderSearch({
  onOpenSearchDocument,
  onOpenSearchTask,
  onSearch,
  showSearchSuggestions = true,
}: AppHeaderSearchProps) {
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const suggestions = useSearchSuggestions(suggestionQuery);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === "document") {
      onOpenSearchDocument(suggestion.id);
    } else if (suggestion.kind === "task") {
      onOpenSearchTask(suggestion.id);
    } else {
      onSearch(suggestion.label);
    }
  };

  return (
    <SearchSuggestionForm
      className="col-start-2 row-start-1 h-[32px] min-w-0 w-full"
      inputId="header-search"
      onQueryChange={setSuggestionQuery}
      onSearch={onSearch}
      showSuggestions={showSearchSuggestions}
      suggestion={{
        getKey: (suggestion) => `${suggestion.kind}:${suggestion.id}`,
        getValue: (suggestion) => suggestion.label,
        items: suggestions,
        maxItems: 10,
        onSelect: selectSuggestion,
        renderItem: (suggestion) => (
          <HeaderSearchSuggestion suggestion={suggestion} />
        ),
      }}
    />
  );
}

type HeaderSearchSuggestionProps = {
  suggestion: SearchSuggestion;
};

function HeaderSearchSuggestion({ suggestion }: HeaderSearchSuggestionProps) {
  const SuggestionIcon =
    suggestion.kind === "document"
      ? FileText
      : suggestion.kind === "task"
        ? ListTodo
        : Clock3;

  return (
    <>
      <span className="flex min-w-0 items-center gap-[8px]">
        <span
          className="
            grid size-[24px] shrink-0 place-items-center border-0 bg-transparent
            text-muted-foreground dark:text-foreground
          "
        >
          <SuggestionIcon className="size-5 text-current" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          {suggestion.label}
        </span>
        <Badge className="h-[20px] shrink-0 border-0" variant="outline">
          {suggestion.kind}
        </Badge>
      </span>
      {suggestion.workspaceId ? (
        <span className="truncate text-xs text-muted-foreground">
          {suggestion.workspaceId}
        </span>
      ) : null}
    </>
  );
}
