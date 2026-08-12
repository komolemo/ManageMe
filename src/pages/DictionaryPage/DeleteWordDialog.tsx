import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/app/DeleteConfirmationDialog";
import { useDictionary } from "./useDictionary";

export function DeleteWordDialog() {
  const { t } = useTranslation();
  const { closeDeleteDialog, confirmDelete, deletingWord, isDeleting } = useDictionary();

  return (
    <DeleteConfirmationDialog
      description={t("dictionary.deleteDescription", { word: deletingWord?.word ?? "" })}
      isDeleting={isDeleting}
      onConfirm={() => void confirmDelete()}
      onOpenChange={(open) => { if (!open) closeDeleteDialog(); }}
      open={Boolean(deletingWord)}
      title={t("dictionary.deleteTitle")}
    />
  );
}
