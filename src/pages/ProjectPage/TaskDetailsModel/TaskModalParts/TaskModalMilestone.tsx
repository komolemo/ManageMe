import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProjectMilestone,
  ProjectTask,
} from "@/features/task/projectTypes";

type TaskModalMilestoneProps = {
  milestones: ProjectMilestone[];
  task: ProjectTask | null;
};

export function TaskModalMilestone({
  milestones,
  task,
}: TaskModalMilestoneProps) {
  const { t } = useTranslation();
  const [selectedMilestone, setSelectedMilestone] = useState("");

  useEffect(() => {
    setSelectedMilestone(task?.milestone ?? milestones[0]?.name ?? "");
  }, [milestones, task]);

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]" htmlFor="issue-detail-milestone">
        {t("task.milestone")}
      </label>
      <Select onValueChange={setSelectedMilestone} value={selectedMilestone}>
        <SelectTrigger
          className="w-full border-0 px-3 py-2"
          id="issue-detail-milestone"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {milestones.map((milestoneOption) => (
            <SelectItem key={milestoneOption.id} value={milestoneOption.name}>
              {milestoneOption.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
