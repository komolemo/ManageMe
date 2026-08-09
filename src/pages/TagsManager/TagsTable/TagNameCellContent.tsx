import { Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditableName1 } from "@/components/app/EditableName";
import { DeleteConfirmationDialog as AppDeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { MenuButton } from "@/components/app/MenuButton";
import { tagColorById } from "@/features/tag/tagColors";
import type { Tag } from "@/features/tag/types";
import { useTagManager } from "../useTagManager";

export function TagNameCellContent({ tag }: { tag: Tag }) {
  const { t } = useTranslation();
  const { changeTagName, setTagToDelete } = useTagManager();
  const tagColor =
    tag.colorId === null ? undefined : tagColorById.get(tag.colorId);

  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        <TagIcon
          className="size-6 shrink-0"
          style={{
            color: tagColor?.value,
            fill: tagColor?.backgroundValue,
          }}
        />
        <EditableName1
          className="text-sm"
          name={tag.name}
          onSaveEditing={(name) => void changeTagName(tag, name)}
        />
      </span>
      <span
        className="shrink-0"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MenuButton
          actions={[
            {
              label: t("common.delete"),
              onSelect: () => setTagToDelete(tag),
            },
          ]}
          ariaLabel={t("tags.openMenu", { tagName: tag.name })}
        />
      </span>
    </div>
  );
}

export function DeleteConfirmationDialog() {
  const { t } = useTranslation();
  const {
    confirmDeleteTag,
    isDeleting,
    setTagToDelete,
    tagToDelete,
  } = useTagManager();

  return (
    <AppDeleteConfirmationDialog
      description={t("tags.deleteDescription", {
        tagName: tagToDelete?.name ?? "",
      })}
      isDeleting={isDeleting}
      onConfirm={() => void confirmDeleteTag()}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setTagToDelete(null);
        }
      }}
      open={tagToDelete !== null}
      title={t("tags.deleteTitle")}
    />
  );
}
