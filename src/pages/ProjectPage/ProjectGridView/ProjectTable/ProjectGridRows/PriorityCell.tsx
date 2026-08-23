import { useState } from "react";
import { TaskPriorityParameter } from "@/components/app/TaskParameters";
import type { ProjectTask } from "@/features/task/projectTypes";

export function PriorityCell({ task }: { task: ProjectTask }) {
  const [priority, setPriority] = useState(task.priority);
  const [isOpen, setIsOpen] = useState(false);
  return <div className="w-full" onDoubleClick={() => setIsOpen(true)}><TaskPriorityParameter isOpen={isOpen} onOpenChange={setIsOpen} onSelectPriority={(value) => setPriority(value as ProjectTask["priority"])} priority={priority} /></div>;
}
