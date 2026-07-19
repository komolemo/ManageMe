import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteConfirmationDialogProps = {
  description: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function DeleteConfirmationDialog({
  description,
  isDeleting = false,
  onConfirm,
  onOpenChange,
  open,
  title,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl p-[16px]">
        <DialogHeader>
          <DialogTitle className="my-[4px] text-lg font-semibold uppercase leading-[18px] tracking-[0.02em]">
            {title}
          </DialogTitle>
          <DialogDescription className="my-[4px] text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-[16px]">
          <Button
            className="w-[100px] rounded-md p-[8px] text-foreground"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="w-[100px] rounded-md bg-destructive p-[8px] text-white hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
