import {
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const searchClearButtonStyle = {
  buttonSize: "24px",
  iconSize: "14px",
  color: "var(--muted-foreground)",
} as const;

export type SearchFormClassNames = {
  clearButton?: string;
  input?: string;
  submitButton?: string;
};

export type SearchFormProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  classNames?: SearchFormClassNames;
  inputId?: string;
  onBlur?: () => void;
  onChange?: (query: string) => void;
  onFocus?: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
};

export function SearchForm({
  ariaLabel = "Search",
  children,
  className,
  classNames,
  inputId = "search-form-query",
  onBlur,
  onChange,
  onFocus,
  onSearch,
  placeholder = "Search",
  value,
}: SearchFormProps) {
  const [uncontrolledQuery, setUncontrolledQuery] = useState("");
  const searchQuery = value ?? uncontrolledQuery;
  const trimmedSearchQuery = searchQuery.trim();
  const searchClearButtonVars = {
    "--search-clear-button-size": searchClearButtonStyle.buttonSize,
    "--search-clear-icon-size": searchClearButtonStyle.iconSize,
    "--search-clear-color": searchClearButtonStyle.color,
  } as CSSProperties;

  const setSearchQuery = (nextQuery: string) => {
    if (value === undefined) {
      setUncontrolledQuery(nextQuery);
    }

    onChange?.(nextQuery);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedSearchQuery) {
      return;
    }

    onSearch(trimmedSearchQuery);
  };

  return (
    <form
      className={cn(
        `
          relative flex min-w-[120px] items-center
          gap-[4px] rounded-full border border-input bg-background
          pl-[16px] text-foreground dark:bg-input/30
        `,
        className
      )}
      onSubmit={handleSearch}
    >
      <label className="sr-only" htmlFor={inputId}>
        {ariaLabel}
      </label>
      <Input
        aria-label={ariaLabel}
        className={cn(
          `
            border-0 bg-transparent px-[0px] text-foreground
            placeholder:text-muted-foreground focus-visible:ring-0
            dark:bg-transparent
          `,
          classNames?.input
        )}
        id={inputId}
        onBlur={onBlur}
        onChange={(event) => setSearchQuery(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        type="search"
        value={searchQuery}
      />
      {searchQuery && (
        <Button
          aria-label={`Clear ${ariaLabel.toLowerCase()}`}
          className={cn(
            `
              size-[var(--search-clear-button-size)] border-0 bg-transparent p-0
              text-[var(--search-clear-color)] hover:bg-muted hover:text-foreground
              dark:bg-transparent dark:hover:bg-muted
            `,
            classNames?.clearButton
          )}
          onClick={() => setSearchQuery("")}
          size="icon-xs"
          style={searchClearButtonVars}
          type="button"
          variant="ghost"
        >
          <X
            aria-hidden="true"
            className="size-[var(--search-clear-icon-size)] text-current"
          />
        </Button>
      )}
      <Button
        aria-label={ariaLabel}
        className={cn(
          `
            w-[56px] h-full rounded-r-full border-0 border-l border-input bg-transparent text-foreground pl-[6px] pr-[8px]
            hover:bg-accent hover:text-accent-foreground
            dark:bg-transparent dark:hover:bg-accent
          `,
          classNames?.submitButton
        )}
        disabled={!trimmedSearchQuery}
        size="icon-lg"
        type="submit"
        variant="outline"
      >
        <Search className="size-5 text-current" />
      </Button>
      {children}
    </form>
  );
}
