import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectBucket, ProjectTask } from "@/features/task/projectTypes";

type TaskModalBucketProps = {
  buckets: ProjectBucket[];
  task: ProjectTask | null;
};

export function TaskModalBucket({ buckets, task }: TaskModalBucketProps) {
  const { t } = useTranslation();
  const [selectedBucket, setSelectedBucket] = useState("");

  useEffect(() => {
    setSelectedBucket(task?.bucket ?? buckets[0]?.name ?? "");
  }, [buckets, task]);

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]" htmlFor="issue-detail-bucket">
        {t("task.bucket")}
      </label>
      <Select onValueChange={setSelectedBucket} value={selectedBucket}>
        <SelectTrigger className="w-full border-0 px-3 py-2" id="issue-detail-bucket">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {buckets.map((bucketOption) => (
            <SelectItem key={bucketOption.id} value={bucketOption.name}>
              {bucketOption.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
