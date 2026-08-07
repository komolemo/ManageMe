import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditableName1 } from "@/components/app/EditableName";
import { TagColorPalette } from "@/components/app/TagColorPalette";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTagStore } from "@/features/tag/tagStore";
import { PageShell } from "@/pages/PageShell";
import { tagColorById, tagColors } from "@/pages/tagsData";

const defaultTagColorId = tagColors[13].id;

type TagSettingProps = {
  tagId: string;
  onBack: () => void;
  onBackInNewTab: () => void;
};

export function TagSetting({
  tagId,
  onBack,
  onBackInNewTab,
}: TagSettingProps) {
  const { t } = useTranslation();
  const tags = useTagStore((state) => state.tags);
  const error = useTagStore((state) => state.error);
  const getTagById = useTagStore((state) => state.getTagById);
  const updateTag = useTagStore((state) => state.updateTag);
  const tag = tags.find((item) => item.tagId === tagId);
  const [tagName, setTagName] = useState("");
  const [selectedTagColorId, setSelectedTagColorId] =
    useState(defaultTagColorId);
  const [draftTagColorId, setDraftTagColorId] = useState(defaultTagColorId);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const tagColor = tagColorById.get(selectedTagColorId);

  useEffect(() => {
    if (tagId && !tag) {
      void getTagById(tagId).catch(() => undefined);
    }
  }, [getTagById, tag, tagId]);

  useEffect(() => {
    if (!tag) {
      return;
    }
    const colorId =
      tag.colorId !== null && tagColorById.has(tag.colorId)
        ? tag.colorId
        : defaultTagColorId;
    setTagName(tag.name);
    setSelectedTagColorId(colorId);
    setDraftTagColorId(colorId);
    setIsColorDialogOpen(false);
  }, [tag]);

  const saveTag = async (name: string, colorId: number) => {
    if (!tag) {
      return;
    }
    await updateTag(tag.tagId, {
      name,
      colorId,
      description: tag.description,
    });
  };

  const handleColorDialogOpenChange = (open: boolean) => {
    if (open) {
      setDraftTagColorId(selectedTagColorId);
      setIsColorDialogOpen(true);
      return;
    }

    setIsColorDialogOpen(false);
    if (draftTagColorId !== selectedTagColorId) {
      setSelectedTagColorId(draftTagColorId);
      void saveTag(tagName, draftTagColorId).catch(() => undefined);
    }
  };

  const openBackPageWithMouseWheel = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button === 1) {
      event.preventDefault();
      onBackInNewTab();
    }
  };

  return (
    <PageShell
      breadcrumbs={[
        {
          label: t("pages.tags"),
          onClick: onBack,
          onAuxClick: openBackPageWithMouseWheel,
        },
        { label: "2" },
      ]}
    >
      <div className="grid gap-2">
        <div>
          <Button
            className="border-0 bg-transparent py-1 pl-1 pr-2 text-muted-foreground hover:text-foreground"
            onAuxClick={openBackPageWithMouseWheel}
            onClick={onBack}
            size="sm"
            type="button"
            variant="outline"
          >
            <ArrowLeft className="size-6" />
            {t("tags.tags")}
          </Button>
        </div>

        {tag ? (
          <section className="flex max-w-xl gap-2">
            <button
              aria-label={t("tags.changeColor")}
              className="m-[2px] flex size-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-1 text-current hover:bg-muted/50"
              onClick={() => setIsColorDialogOpen(true)}
              type="button"
            >
              <Tag
                style={{
                  color: tagColor?.value,
                  fill: tagColor?.backgroundValue,
                }}
              />
            </button>
            <EditableName1
              name={tagName}
              onSaveEditing={(name) => {
                const nextName = name.trim();
                if (!nextName) {
                  return;
                }
                setTagName(nextName);
                void saveTag(nextName, selectedTagColorId).catch(
                  () => undefined,
                );
              }}
            />
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            {error ?? t("tags.noneFound")}
          </p>
        )}
      </div>

      <Dialog
        onOpenChange={handleColorDialogOpenChange}
        open={isColorDialogOpen}
      >
        <DialogContent className="max-w-[425px] gap-4 rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="my-1 text-lg font-semibold uppercase leading-[18px] tracking-[0.02em]">
              {t("tags.tagColor")}
            </DialogTitle>
            <DialogDescription className="my-1 text-base text-muted-foreground">
              {t("tags.selectColor")}
            </DialogDescription>
          </DialogHeader>
          <TagColorPalette
            onColorChange={setDraftTagColorId}
            selectedColorId={draftTagColorId}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
