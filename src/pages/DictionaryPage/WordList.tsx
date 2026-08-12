import { useTranslation } from "react-i18next";
import { MenuButton } from "@/components/app/MenuButton";
import type { DictionaryWord } from "@/features/dictionary/types";
import { useDictionaryManager } from "./useDictionaryManager";

type WordListProps = {
  isLoading: boolean;
  onDelete: (word: DictionaryWord) => void;
  words: DictionaryWord[];
};

export function WordList({ isLoading, onDelete, words }: WordListProps) {
  const { t } = useTranslation();
  const { openEdit } = useDictionaryManager();

  if (!isLoading && words.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        {t("dictionary.noneFound")}
      </div>
    );
  }

  return (
    <dl className="m-0 overflow-hidden rounded-lg border">
      {words.map((item) => (
        <div
          className="grid grid-cols-[minmax(0,210px)_minmax(0,1fr)_24px] items-start gap-6 border-b px-5 py-4 last:border-b-0"
          key={item.dictionaryWordId}
        >
          <dt className="text-base font-semibold">{item.word}</dt>
          <dd className="m-0">
            <p className="m-0 text-sm leading-7 text-foreground/85">
              {item.description || "—"}
            </p>
          </dd>
          <dd className="m-0">
            <MenuButton
              actions={[
                { label: t("common.rename"), onSelect: () => openEdit(item) },
                { label: t("common.delete"), onSelect: () => onDelete(item) },
              ]}
              ariaLabel={t("dictionary.openMenu", { word: item.word })}
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
