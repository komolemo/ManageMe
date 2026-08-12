import { useTranslation } from "react-i18next";
import { SearchForm } from "@/components/app/SearchForm";
import { useDictionary } from "./useDictionary";

export function DictionarySearchForm() {
  const { t } = useTranslation();
  const { changeQuery, query, search } = useDictionary();

  return (
    <SearchForm
      className="h-9 w-[280px]"
      inputId="dictionary-search"
      onChange={changeQuery}
      onSearch={search}
      placeholder={t("dictionary.search")}
      value={query}
    />
  );
}
