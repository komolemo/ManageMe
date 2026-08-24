import { useEffect, useState, type ReactNode } from "react";

import {
  SearchForm,
  type SearchFormClassNames,
} from "@/components/app/SearchForm";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type SearchSuggestionFormClassNames = SearchFormClassNames & {
  noSuggestions?: string;
  suggestionButton?: string;
  suggestions?: string;
};

type SearchSuggestionConfig<TSuggestion> = {
  getKey?: (suggestion: TSuggestion) => string;
  getValue: (suggestion: TSuggestion) => string;
  items: TSuggestion[];
  maxItems?: number;
  noResultsText?: string;
  onSelect?: (suggestion: TSuggestion) => void;
  renderItem?: (suggestion: TSuggestion) => ReactNode;
};

export type SearchSuggestionFormProps<TSuggestion> = {
  ariaLabel?: string;
  className?: string;
  classNames?: SearchSuggestionFormClassNames;
  inputId?: string;
  initialValue?: string;
  onQueryChange?: (query: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  suggestion: SearchSuggestionConfig<TSuggestion>;
};

export function SearchSuggestionForm<TSuggestion>({
  ariaLabel,
  className,
  classNames,
  inputId,
  initialValue = "",
  onQueryChange,
  onSearch,
  placeholder,
  showSuggestions = true,
  suggestion,
}: SearchSuggestionFormProps<TSuggestion>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trimmedSearchQuery = searchQuery.trim();
  const visibleSuggestions = trimmedSearchQuery
    ? suggestion.items.slice(0, suggestion.maxItems ?? 5)
    : [];
  const showsSuggestions =
    showSuggestions && isSearchFocused && Boolean(trimmedSearchQuery);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const selectSuggestion = (item: TSuggestion) => {
    const value = suggestion.getValue(item);
    setSearchQuery(value);
    onQueryChange?.(value);
    setIsSearchFocused(false);
    suggestion.onSelect?.(item);
  };

  return (
    <SearchForm
      ariaLabel={ariaLabel}
      className={className}
      classNames={classNames}
      inputId={inputId}
      onBlur={() => setIsSearchFocused(false)}
      onChange={(query) => {
        setSearchQuery(query);
        onQueryChange?.(query);
      }}
      onFocus={() => setIsSearchFocused(true)}
      onSearch={(query) => {
        setIsSearchFocused(false);
        onSearch(query);
      }}
      placeholder={placeholder}
      value={searchQuery}
    >
      {showsSuggestions ? (
        <SearchSuggestions
          classNames={classNames}
          getSuggestionKey={suggestion.getKey}
          getSuggestionValue={suggestion.getValue}
          noSuggestionsText={suggestion.noResultsText ?? t("header.noSuggestions")}
          onSelectSuggestion={selectSuggestion}
          renderSuggestion={suggestion.renderItem}
          suggestions={visibleSuggestions}
        />
      ) : null}
    </SearchForm>
  );
}

type SearchSuggestionsProps<TSuggestion> = {
  classNames?: SearchSuggestionFormClassNames;
  getSuggestionKey?: (suggestion: TSuggestion) => string;
  getSuggestionValue: (suggestion: TSuggestion) => string;
  noSuggestionsText: string;
  onSelectSuggestion: (suggestion: TSuggestion) => void;
  renderSuggestion?: (suggestion: TSuggestion) => ReactNode;
  suggestions: TSuggestion[];
};

function SearchSuggestions<TSuggestion>({
  classNames,
  getSuggestionKey,
  getSuggestionValue,
  noSuggestionsText,
  onSelectSuggestion,
  renderSuggestion,
  suggestions,
}: SearchSuggestionsProps<TSuggestion>) {
  return (
    <div
      className={cn(
        `
          absolute left-0 top-[calc(100%+4px)] z-50 grid w-full rounded-md
          overflow-hidden border-0 bg-popover text-popover-foreground
          shadow-lg shadow-foreground/10 dark:bg-popover-2 dark:text-popover-foreground
          dark:shadow-black/40
        `,
        classNames?.suggestions
      )}
      role="listbox"
    >
      {suggestions.length > 0 ? (
        suggestions.map((suggestion) => {
          const suggestionValue = getSuggestionValue(suggestion);

          return (
            <button
              className={cn(
                `
                  grid min-w-0 gap-[6px] border-0 px-3 py-[10px]
                  bg-popover text-left text-popover-foreground last:border-b-0
                  hover:bg-muted focus-visible:bg-muted
                  dark:bg-popover-2 dark:hover:bg-accent-2 dark:focus-visible:bg-accent
                `,
                classNames?.suggestionButton
              )}
              key={getSuggestionKey?.(suggestion) ?? suggestionValue}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelectSuggestion(suggestion);
              }}
              role="option"
              type="button"
            >
              {renderSuggestion ? renderSuggestion(suggestion) : suggestionValue}
            </button>
          );
        })
      ) : (
        <div
          className={cn(
            "bg-popover px-[12px] py-[10px] text-xs text-muted-foreground dark:bg-popover-2 dark:text-muted-foreground",
            classNames?.noSuggestions
          )}
        >
          {noSuggestionsText}
        </div>
      )}
    </div>
  );
}
