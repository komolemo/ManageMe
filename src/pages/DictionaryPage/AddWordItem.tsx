import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type WordForm = {
  description: string;
  furigana: string;
  word: string;
};

export function AddWordButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <CreateNewButton onClick={onClick}>
      {t("dictionary.create")}
    </CreateNewButton>
  );
}

type AddWordDialogProps = {
  form: WordForm;
  hasInvalidFurigana: boolean;
  isEditing: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  setForm: Dispatch<SetStateAction<WordForm>>;
  setShowFuriganaError: Dispatch<SetStateAction<boolean>>;
  showFuriganaError: boolean;
};

export function AddWordDialog({
  form,
  hasInvalidFurigana,
  isEditing,
  isOpen,
  isSaving,
  onOpenChange,
  onSubmit,
  setForm,
  setShowFuriganaError,
  showFuriganaError,
}: AddWordDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[425px] gap-4 rounded-2xl p-4">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("dictionary.edit") : t("dictionary.create")}</DialogTitle>
          <DialogDescription>{t("dictionary.formHelp")}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          <label className="grid gap-1.5 text-sm">
            {t("dictionary.word")}
            <Input required value={form.word} onChange={(event) => setForm({ ...form, word: event.target.value })} />
          </label>
          <label className="grid gap-1.5 text-sm">
            {t("dictionary.furigana")}
            <Input
              aria-describedby="dictionary-furigana-help"
              aria-invalid={showFuriganaError && hasInvalidFurigana}
              value={form.furigana}
              onChange={(event) => {
                setShowFuriganaError(false);
                setForm({ ...form, furigana: event.target.value });
              }}
            />
            <span
              className={`text-xs ${showFuriganaError && hasInvalidFurigana ? "text-destructive" : "text-muted-foreground"}`}
              id="dictionary-furigana-help"
            >
              {showFuriganaError && hasInvalidFurigana
                ? t("dictionary.furiganaError")
                : t("dictionary.furiganaHelp")}
            </span>
          </label>
          <label className="grid gap-1.5 text-sm">
            {t("dictionary.description")}
            <textarea
              className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <DialogFooter className="flex-row justify-end gap-4">
            <Button disabled={isSaving} onClick={() => onOpenChange(false)} type="button" variant="outline">
              {t("common.cancel")}
            </Button>
            <Button disabled={isSaving || !form.word.trim()} type="submit">
              {isEditing ? t("common.rename") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
