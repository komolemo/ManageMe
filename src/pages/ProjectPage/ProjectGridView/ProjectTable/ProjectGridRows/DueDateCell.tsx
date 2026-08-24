import { useState } from "react";
import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import type { ProjectTask } from "@/features/task/projectTypes";

export function DueDateCell({ task }: { task: ProjectTask }) {
  const [value, setValue] = useState(() => task.dueDate.replace(/-/g, "/"));
  const [popup, setPopup] = useState<DueDatePopup | null>(null);
  const open = (rect: DOMRect, mode: DueDatePopup["mode"]) =>
    setPopup({
      taskId: task.id,
      left: rect.left,
      top: rect.bottom + 6,
      mode,
    });

  return (
    <div
      className="w-full"
      onDoubleClick={(event) =>
        open(event.currentTarget.getBoundingClientRect(), "calendar")
      }
    >
      <TaskDueDateParameter
        isActive={Boolean(popup)}
        onClose={() => setPopup(null)}
        onCommit={setValue}
        onOpen={open}
        popup={popup}
        value={value}
      />
    </div>
  );
}
