import type { FormEvent, RefObject } from "react";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

type NewTaskFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function NewTaskForm({ inputRef, onClear, onSubmit }: NewTaskFormProps) {
  const { t } = useTranslation();
  return (
    <form
      className="flex shrink-0 items-center gap-[8px] border-t bg-card px-[8px] py-[6px]"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="project-grid-new-task-name">
        {t("task.taskName")}
      </label>
      <Input
        aria-label={t("task.taskName")}
        className="h-[30px] pl-[8px] min-w-0 flex-1 border-0 rounded-md"
        id="project-grid-new-task-name"
        placeholder={t("task.taskName")}
        ref={inputRef}
      />
      <Button
        className="h-[32px] px-4 rounded-md border-0"
        onClick={onClear}
        type="button"
        variant="outline"
      >
        {t("common.clear")}
      </Button>
      <CreateNewButton type="submit">{t("common.addTask")}</CreateNewButton>
    </form>
  );
}
