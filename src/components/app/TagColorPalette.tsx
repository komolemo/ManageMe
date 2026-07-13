import { Check } from "lucide-react";
import { tagColors } from "@/pages/tagsData";
import { useTranslation } from "react-i18next";

type TagColorPaletteProps = {
  selectedColorId: number;
  onColorChange: (colorId: number) => void;
};

export function TagColorPalette({
  selectedColorId,
  onColorChange,
}: TagColorPaletteProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-[8px]">
      <span className="text-sm font-medium">{t("sort.color")}</span>
      <div className="grid grid-cols-[repeat(7,32px)] gap-[8px]">
        {tagColors.map((color) => {
          const isSelected = color.id === selectedColorId;

          return (
            <button
              aria-label={t(`colors.${color.name}`)}
              aria-pressed={isSelected}
              className="flex h-[32px] w-[32px] min-w-[32px] appearance-none items-center justify-center rounded-full border-2 p-0 transition hover:ring-2 hover:ring-ring"
              key={color.id}
              onClick={() => onColorChange(color.id)}
              style={{
                backgroundColor: color.backgroundValue,
                borderColor: color.value,
              }}
              title={t(`colors.${color.name}`)}
              type="button"
            >
              {isSelected ? (
                <Check className="size-[16px]" style={{ color: color.value }} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
