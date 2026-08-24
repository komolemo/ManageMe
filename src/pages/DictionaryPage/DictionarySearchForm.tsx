import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchForm } from "@/components/app/SearchForm";
import { useDictionary } from "./useDictionary";

export function DictionarySearchForm() {
  const { t } = useTranslation();
  const { clearSearch, query, search } = useDictionary();
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => setInputValue(query), [query]);

  return (
    <SearchForm
      className="h-9 w-[280px]"
      inputId="dictionary-search"
      onChange={(value) => {
        setInputValue(value);
        if (!value.trim() && query) clearSearch();
      }}
      onSearch={search}
      placeholder={t("dictionary.search")}
      value={inputValue}
    />
  );
}
