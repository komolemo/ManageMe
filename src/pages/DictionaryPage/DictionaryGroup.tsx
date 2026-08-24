import { useTranslation } from "react-i18next";
import { SidebarItem } from "@/components/app/SidebarItem";

const dictionaryGroups = [
  "A–E", "F–J", "K–O", "P–T", "U–Z",
  "あ～お", "か～こ", "さ～そ", "た～と", "な～の",
  "は～ほ", "ま～も", "や～よ", "ら～ろ", "わ～ん",
] as const;

export type DictionaryGroup = (typeof dictionaryGroups)[number];

type DictionaryGroupListProps = {
  activeGroup: DictionaryGroup;
  onSelect: (group: DictionaryGroup) => void;
  query: string;
};

export function DictionaryGroupList({
  activeGroup,
  onSelect,
  query,
}: DictionaryGroupListProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("dictionary.index")} className="grid gap-1">
      {dictionaryGroups.map((group) => (
        <SidebarItem
          key={group}
          selected={!query.trim() && activeGroup === group}
        >
          <button
            className="flex min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-left text-sm text-current"
            onClick={() => onSelect(group)}
            type="button"
          >
            {group}
          </button>
        </SidebarItem>
      ))}
    </nav>
  );
}
