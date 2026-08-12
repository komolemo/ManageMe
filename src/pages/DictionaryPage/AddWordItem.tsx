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
import { useDictionary, type WordForm } from "./useDictionary";

const emptyForm = (): WordForm => ({ description: "", furigana: "", word: "" });
const hiraganaPattern = /^[\p{Script=Hiragana}ー]*$/u;

export function AddWordButton() {
  const { t } = useTranslation();
  const { openCreate } = useDictionary();

  return (
    <CreateNewButton onClick={openCreate}>{t("dictionary.create")}</CreateNewButton>
  );
}

export function AddWordDialog() {
  const { t } = useTranslation();
  const {
    closeDialog,
    editingWord,
    isFormOpen,
    isSaving,
    saveWord,
    setIsFormOpen,
  } = useDictionary();
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [showFuriganaError, setShowFuriganaError] = useState(false);
  const hasInvalidFurigana = !hiraganaPattern.test(form.furigana);

  useEffect(() => {
    if (!isFormOpen) return;
    setForm(editingWord
      ? {
          description: editingWord.description,
          furigana: hiraganaPattern.test(editingWord.normalizedWord)
            ? editingWord.normalizedWord
            : "",
          word: editingWord.word,
        }
      : emptyForm());
    setShowFuriganaError(false);
  }, [editingWord, isFormOpen]);

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogContent className="max-w-[425px] gap-4 rounded-2xl p-4">
        <DialogHeader>
          <DialogTitle>{editingWord ? t("dictionary.edit") : t("dictionary.create")}</DialogTitle>
          <DialogDescription>{t("dictionary.formHelp")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (hasInvalidFurigana) {
              setShowFuriganaError(true);
              return;
            }
            void saveWord(form);
          }}
        >
          {/* 単語名入力 */}
          <label className="grid gap-1.5 text-sm">
            {t("dictionary.word")}
            <Input required value={form.word} onChange={(event) => setForm({ ...form, word: event.target.value })} />
          </label>
          {/* 単語フリガナ入力 */}
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
          {/* 単語説明入力 */}
          <label className="grid gap-1.5 text-sm">
            {t("dictionary.description")}
            <textarea
              className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          {/* フッター */}
          <DialogFooter className="flex-row justify-end gap-4">
            {/* キャンセルボタン */}
            <Button disabled={isSaving} onClick={closeDialog} type="button" variant="outline">
              {t("common.cancel")}
            </Button>
            {/* 追加ボタン */}
            <Button disabled={isSaving || !form.word.trim()} type="submit">
              {editingWord ? t("common.rename") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
