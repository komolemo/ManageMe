import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ProjectTask } from "@/features/task/projectTypes";

type TaskModalDescriptionProps = {
  task: ProjectTask;
};

export function TaskModalDescription({ task }: TaskModalDescriptionProps) {
  const { t } = useTranslation();
  const [details, setDetails] = useState(task.details);

  useEffect(() => {
    setDetails(task.details);
  }, [task]);

  return (
    <div className="grid gap-[6px]">
      <label
        className="font-medium text-[14px]"
        htmlFor="issue-detail-description"
      >
        {t("task.description")}
      </label>
      <div className="min-h-[112px] border border-transparent transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
        <textarea
          className="block min-h-[110px] w-full resize-none rounded-none border-0 bg-transparent p-[4px] text-xs text-foreground outline-none placeholder:text-muted-foreground dark:bg-input/30"
          id="issue-detail-description"
          onChange={(event) => setDetails(event.target.value)}
          value={details}
        />
      </div>
    </div>
  );
}
