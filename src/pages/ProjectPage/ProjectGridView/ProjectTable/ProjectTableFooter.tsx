import { useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProjectTableFooterProps = {
  onCreateTask: (name: string) => boolean;
};

export function ProjectTableFooter({
  onCreateTask,
}: ProjectTableFooterProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const clear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onCreateTask(inputRef.current?.value ?? "") && inputRef.current) {
      inputRef.current.value = "";
    }
  };
  return (
    <form
      className="flex shrink-0 items-center gap-[8px] border-t bg-card px-[8px] py-[6px]"
      onSubmit={submit}
    >
      <label className="sr-only" htmlFor="project-grid-new-task-name">
        {t("task.taskName")}
      </label>
      <Input
        aria-label={t("task.taskName")}
        className="h-[30px] min-w-0 flex-1 rounded-md border-0 pl-[8px]"
        id="project-grid-new-task-name"
        placeholder={t("task.taskName")}
        ref={inputRef}
      />
      <Button
        className="h-[32px] rounded-md border-0 px-4"
        onClick={clear}
        type="button"
        variant="outline"
      >
        {t("common.clear")}
      </Button>
      <CreateNewButton type="submit">
        {t("common.addTask")}
      </CreateNewButton>
    </form>
  );
}
