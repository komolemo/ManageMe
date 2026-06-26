import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, type FormEvent } from "react";

type CreateTaskCardProps = {
  onAdd: (taskName: string) => void;
  onCancel: () => void;
  status: string;
};

export function CreateTaskCard({ onAdd, onCancel, status }: CreateTaskCardProps) {
  const [taskName, setTaskName] = useState("");
  const createCardRef = useRef<HTMLDivElement | null>(null);
  const taskNameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    taskNameInputRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (
        createCardRef.current &&
        !createCardRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onCancel]);

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd(taskName);
  };

  return (
    <Card
      className="shrink-0 p-[12px] bg-muted rounded-[2px] ring-0 shadow-[0_10px_15px_-3px_var(--shadow),0_4px_6px_-4px_var(--shadow)]"
      ref={createCardRef}
      size="sm"
    >
      <form onSubmit={submitTask}>
        <CardContent className="grid gap-[8px] p-[0px]">
          <label className="sr-only" htmlFor={`new-task-${status}`}>
            Task name
          </label>
          <Input
            className="border-0 p-[6px] rounded-md focus:ring-0 focus-visible:ring-0"
            id={`new-task-${status}`}
            onChange={(event) => setTaskName(event.target.value)}
            placeholder="Task name"
            ref={taskNameInputRef}
            value={taskName}
          />
          <div className="flex justify-end gap-[8px]">
            <Button onClick={onCancel} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!taskName.trim()} type="submit">
              Add
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
