import { useState } from "react";
import { TaskBucketParameter } from "@/components/app/TaskParameters";
import type { BucketName, ProjectTask } from "@/features/task/projectTypes";

export function StatusCell({ bucketNames, task }: { bucketNames: string[]; task: ProjectTask }) {
  const [status, setStatus] = useState<BucketName>(task.status);
  const [isOpen, setIsOpen] = useState(false);
  return <div className="w-full" onDoubleClick={() => setIsOpen(true)}><TaskBucketParameter bucketNames={bucketNames} isOpen={isOpen} onOpenChange={setIsOpen} onSelectStatus={(value) => setStatus(value as BucketName)} status={status} /></div>;
}
