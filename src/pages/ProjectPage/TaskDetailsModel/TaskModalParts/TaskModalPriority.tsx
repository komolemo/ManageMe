import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectTask } from "@/features/task/projectTypes";
import { taskPriorityLabels } from "@/features/task/taskPriority";

type TaskModalPriorityProps = {
  priority: ProjectTask["priority"];
};

const priorityOptions: ProjectTask["priority"][] = [...taskPriorityLabels];

export function TaskModalPriority({ priority }: TaskModalPriorityProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]" htmlFor="issue-detail-priority">
        {t("task.priority")}
      </label>
      <Select value={priority}>
        <SelectTrigger
          className="w-full border-0 px-3 py-2"
          id="issue-detail-priority"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((priorityOption) => (
            <SelectItem key={priorityOption} value={priorityOption}>
              {t(`task.priorityValues.${priorityOption}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
