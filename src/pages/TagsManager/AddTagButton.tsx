import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { TagColorPalette } from "@/components/app/TagColorPalette";
import { AddItemDialogFooter } from "@/components/app/AddItemDialogFooter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { tagColors } from "@/features/tag/tagColors";
import { useTagManager } from "./useTagManager";

const defaultTagColor = tagColors[0].id;

export function AddTagButton() {
  const { setIsCreateDialogOpen } = useTagManager();

  return (
    <CreateNewButton onClick={() => setIsCreateDialogOpen(true)} />
  );
}

export function AddTagDialog() {
  const { t } = useTranslation();
  const { createTag, error, isCreateDialogOpen, setIsCreateDialogOpen } =
    useTagManager();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(defaultTagColor);

  const resetDialog = () => {
    setNewTagName("");
    setNewTagColor(defaultTagColor);
    setIsCreateDialogOpen(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      if (await createTag(newTagName, newTagColor)) resetDialog();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) =>
        open ? setIsCreateDialogOpen(true) : resetDialog()
      }
      open={isCreateDialogOpen}
    >
      <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl p-[16px]">
        <DialogHeader>
          <DialogTitle className="my-[4px] text-lg font-semibold uppercase leading-[18px] tracking-[0.02em]">
            {t("tags.createTag")}
          </DialogTitle>
          <DialogDescription className="my-[4px] text-sm text-muted-foreground">
            {t("tags.createHelp")}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid w-full min-w-0 gap-[16px]"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateTag();
          }}
        >
          <Input
            aria-label={t("tags.tagName")}
            autoFocus
            className="h-[36px] w-full min-w-0 rounded-md px-[8px]"
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder={t("tags.tagName")}
            value={newTagName}
          />
          <TagColorPalette
            onColorChange={setNewTagColor}
            selectedColorId={newTagColor}
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter className="flex-row justify-end gap-[16px]">
            <AddItemDialogFooter
              resetDialog={resetDialog}
              isDisabled={!newTagName.trim()}
              isCreating={isCreating}
              submitLabel={t("common.create")}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
