import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchForm } from "@/components/app/SearchForm";
import { useTagManager } from "./useTagManager";

export function TagSearchForm() {
  const { t } = useTranslation();
  const { search } = useTagManager();
  const [searchInput, setSearchInput] = useState("");

  const changeSearchInput = (value: string) => {
    setSearchInput(value);
    if (!value) search("");
  };

  return (
    <SearchForm
      aria-label={t("tags.tagSearch")}
      className="h-[32px] w-full"
      classNames={{ input: "h-[30px] py-[5px]" }}
      inputId="tag-search-query"
      onChange={changeSearchInput}
      onSearch={search}
      placeholder={t("tags.searchTags")}
      value={searchInput}
    />
  );
}
