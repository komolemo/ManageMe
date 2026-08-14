import { useTranslation } from "react-i18next";

import { TagInput } from "@/components/app/TagInput";
import type { ProjectTask } from "@/features/task/projectTypes";
import { useTagBindings } from "@/hooks/useTagBindings";

type TaskModalTagProps = {
  task: ProjectTask | null;
};

export function TaskModalTag({ task }: TaskModalTagProps) {
  const { t } = useTranslation();
  const { setTags: setAssignedTags, tags: assignedTags } = useTagBindings({
    taskId: task ? String(task.id) : undefined,
  });

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]" htmlFor="issue-detail-tags">
        {t("task.tags")}
      </label>
      <TagInput
        inputId="issue-detail-tags"
        onChange={setAssignedTags}
        value={assignedTags}
      />
    </div>
  );
}
