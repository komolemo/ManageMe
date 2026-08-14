import { useTranslation } from "react-i18next";

import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";

type TaskModalDateProps = {
  isActive: boolean;
  onClose: () => void;
  onCommit: (date: string) => void;
  onOpen: (rect: DOMRect, mode: DueDatePopup["mode"]) => void;
  popup: DueDatePopup | null;
  value: string;
};

export function TaskModalStartDate({
  isActive,
  onClose,
  onCommit,
  onOpen,
  popup,
  value,
}: TaskModalDateProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]">{t("task.startDate")}</label>
      <div
        className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs"
        data-date-field
      >
        <TaskDueDateParameter
          calendarPlacement="inline"
          isActive={isActive}
          onClose={onClose}
          onCommit={onCommit}
          onOpen={onOpen}
          popup={popup}
          value={value}
        />
      </div>
    </div>
  );
}

export function TaskModalDueDate({
  isActive,
  onClose,
  onCommit,
  onOpen,
  popup,
  value,
}: TaskModalDateProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-[6px]">
      <label className="font-medium text-[14px]">{t("task.dueDate")}</label>
      <div
        className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs"
        data-date-field
      >
        <TaskDueDateParameter
          calendarPlacement="inline"
          isActive={isActive}
          onClose={onClose}
          onCommit={onCommit}
          onOpen={onOpen}
          popup={popup}
          value={value}
        />
      </div>
    </div>
  );
}
