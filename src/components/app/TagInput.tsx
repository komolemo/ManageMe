import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/features/tag/tagStore";
import type { Tag } from "@/features/tag/types";
import { useTranslation } from "react-i18next";

type TagInputProps = {
  inputId?: string;
  onChange: (tags: string[]) => void;
  value: string[];
};

export function TagInput({ inputId, onChange, value }: TagInputProps) {
  const { t } = useTranslation();
  const tagSuggestions = useTagStore((state) => state.tags);
  const loadTags = useTagStore((state) => state.loadTags);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const normalizedInputValue = inputValue.trim().toLowerCase();
  const normalizedAssignedTags = useMemo(
    () => new Set(value.map((tag) => tag.toLowerCase())),
    [value]
  );
  useEffect(() => {
    void loadTags().catch(() => undefined);
  }, [loadTags]);
  const visibleSuggestions = useMemo(() => {
    if (normalizedInputValue.length < 2) {
      return [];
    }

    return tagSuggestions
      .filter(
        (tag) =>
          tag.name.toLowerCase().includes(normalizedInputValue) &&
          !normalizedAssignedTags.has(tag.name.toLowerCase())
      )
      .slice(0, 5);
  }, [normalizedAssignedTags, normalizedInputValue]);
  const showsSuggestions = isFocused && inputValue.trim().length >= 2;

  const addTag = (tagName: string) => {
    const nextTagName = tagName.trim();

    if (!nextTagName || normalizedAssignedTags.has(nextTagName.toLowerCase())) {
      setInputValue("");
      return;
    }

    onChange([...value, nextTagName]);
    setInputValue("");
  };

  const removeTag = (tagName: string) => {
    onChange(value.filter((tag) => tag !== tagName));
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          `
            flex min-h-[24px] cursor-text flex-wrap items-center gap-[6px]
            rounded-md border border-transparent px-[2px] py-[2px]
            transition-colors focus-within:border-ring focus-within:ring-1
            focus-within:ring-ring/50
          `,
          isFocused ? "overflow-y-auto bg-background" : "max-h-[32px] overflow-hidden bg-transparent"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge
            className="gap-[2px] rounded-sm border-0 bg-muted pl-[8px] pb-[2px] text-foreground"
            key={tag}
            variant="secondary"
          >
            {tag}
            <Button
              aria-label={t("tags.unlink", { tagName: tag })}
              className={cn(
                `
                  size-[24px] rounded-sm border-0 bg-transparent p-[0px]
                  text-muted-foreground hover:bg-muted-foreground/15
                  hover:text-foreground
                `,
                !isFocused && "pointer-events-none opacity-0"
              )}
              disabled={!isFocused}
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag);
              }}
              onKeyDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              size="icon-xs"
              tabIndex={isFocused ? 0 : -1}
              type="button"
              variant="ghost"
            >
              <X className={cn("size-[16px]", !isFocused && "text-transparent")} />
            </Button>
          </Badge>
        ))}
        <Input
          aria-label={t("tags.input")}
          className="
            h-[24px] min-w-[96px] flex-1 border-0 px-0 py-0
            text-xs shadow-none focus-visible:ring-0
          "
          style={{background:"transparent"}}
          id={inputId}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleInputKeyDown}
          ref={inputRef}
          value={inputValue}
        />
      </div>
      {showsSuggestions ? (
        <TagSuggestions
          onSelectTag={(tagName) => {
            addTag(tagName);
            inputRef.current?.focus();
          }}
          suggestions={visibleSuggestions}
        />
      ) : null}
    </div>
  );
}

type TagSuggestionsProps = {
  onSelectTag: (tagName: string) => void;
  suggestions: Tag[];
};

function TagSuggestions({ onSelectTag, suggestions }: TagSuggestionsProps) {
  const { t } = useTranslation();
  return (
    <div
      className="
        absolute left-0 top-[calc(100%+4px)] z-50 grid w-full min-w-[240px]
        overflow-hidden rounded-md border-0 bg-popover text-popover-foreground
        shadow-lg shadow-foreground/10 dark:bg-popover-2
        dark:text-popover-foreground dark:shadow-black/40
      "
      role="listbox"
    >
      {suggestions.length > 0 ? (
        suggestions.map((suggestion) => (
          <button
            className="
              grid min-w-0 border-0 bg-popover px-[12px] py-[10px] text-left
              text-xs text-popover-foreground hover:bg-muted
              focus-visible:bg-muted dark:bg-popover-2 dark:hover:bg-accent-2
              dark:focus-visible:bg-accent
            "
            key={suggestion.tagId}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelectTag(suggestion.name);
            }}
            role="option"
            type="button"
          >
            {suggestion.name}
          </button>
        ))
      ) : (
        <div className="bg-popover px-[12px] py-[10px] text-xs text-muted-foreground dark:bg-popover-2">
          {t("tags.noSuggestions")}
        </div>
      )}
    </div>
  );
}
