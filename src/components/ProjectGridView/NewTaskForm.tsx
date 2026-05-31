import type { FormEvent, RefObject } from "react";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewTaskFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function NewTaskForm({ inputRef, onClear, onSubmit }: NewTaskFormProps) {
  return (
    <form
      className="flex shrink-0 items-center gap-[8px] border-t bg-card px-[8px] py-[6px]"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="project-grid-new-task-name">
        Task name
      </label>
      <Input
        aria-label="Task name"
        className="h-[30px] pl-[8px] min-w-0 flex-1 border-0 rounded-md"
        id="project-grid-new-task-name"
        placeholder="Task name"
        ref={inputRef}
      />
      <Button
        className="h-[32px] px-[16px] rounded-md border-0"
        onClick={onClear}
        type="button"
        variant="outline"
      >
        Clear
      </Button>
      <CreateNewButton type="submit">Add Task</CreateNewButton>
    </form>
  );
}
