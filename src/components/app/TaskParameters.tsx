import type {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
} from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { boardStatuses, type ProjectTask } from "@/pages/projectData";

export type DueDatePopup = {
  taskId: string;
  left: number;
  top: number;
  mode: "calendar" | "text";
};

const priorityOptions: ProjectTask["priority"][] = ["Low", "Medium", "High"];

export const formatCalendarDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export const parseCalendarDate = (value: string) => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split(/[-/]/).map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

export const toDateInputValue = (value: string) =>
  value.replace(/[^\d/]/g, "").replace(/-/g, "/").slice(0, 10);

export const validateDateInput = (value: string) => {
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return formatCalendarDate(date);
};

type TaskStatusParameterProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectStatus: (status: string) => void;
  status: ProjectTask["status"];
};

export function TaskStatusParameter({
  isOpen,
  onOpenChange,
  onSelectStatus,
  status,
}: TaskStatusParameterProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      {/* ステータスメニューを開くためのセル内ボタン */}
      <DropdownMenuTrigger asChild>
        <button
          className="
            flex w-full min-w-0 rounded-sm bg-transparent px-0 text-left outline-none border-0
            text-foreground
            focus-visible:ring-[2px] focus-visible:ring-ring
          "
          onDoubleClick={(event) => event.stopPropagation()}
          style={{ backgroundColor: "transparent" }}
          type="button"
        >
          {/* 現在選択されているステータス表示 */}
          <span className="truncate">{status}</span>
        </button>
      </DropdownMenuTrigger>
      {/* ステータス候補を表示するドロップダウン */}
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {/* 選択中のステータスを管理するラジオグループ */}
        <DropdownMenuRadioGroup onValueChange={onSelectStatus} value={status}>
          {boardStatuses.map((statusOption) => (
            // ステータス候補ごとの選択項目
            <DropdownMenuRadioItem key={statusOption} value={statusOption}>
              {statusOption}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type TaskPriorityParameterProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectPriority: (priority: string) => void;
  priority: ProjectTask["priority"];
};

export function TaskPriorityParameter({
  isOpen,
  onOpenChange,
  onSelectPriority,
  priority,
}: TaskPriorityParameterProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      {/* 優先度メニューを開くためのセル内ボタン */}
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full min-w-0 rounded-sm bg-transparent px-0 text-left outline-none focus-visible:ring-[2px] focus-visible:ring-ring"
          onDoubleClick={(event) => event.stopPropagation()}
          style={{ backgroundColor: "transparent" }}
          type="button"
        >
          {/* 現在選択されている優先度バッジ */}
          <Badge variant={priority === "High" ? "default" : "outline"}>
            {priority}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      {/* 優先度候補を表示するドロップダウン */}
      <DropdownMenuContent align="start" className="min-w-[100px]">
        {/* 選択中の優先度を管理するラジオグループ */}
        <DropdownMenuRadioGroup onValueChange={onSelectPriority} value={priority}>
          {priorityOptions.map((priorityOption) => (
            // 優先度候補ごとの選択項目
            <DropdownMenuRadioItem key={priorityOption} value={priorityOption}>
              {priorityOption}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type TaskDueDateParameterProps = {
  dueDate: string;
  dueDateInput: string;
  dueDateInputError: string;
  dueDateInputRef: RefObject<HTMLInputElement | null>;
  calendarRef: RefObject<HTMLDivElement | null>;
  isCalendarOpen: boolean;
  isTextInputOpen: boolean;
  onChangeDueDateInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenDueDateCalendar: (button: HTMLButtonElement) => void;
  onSaveDueDateInput: () => void;
  onSelectDueDate: (date?: Date) => void;
  onDueDateInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  popup: DueDatePopup | null;
};

export function TaskDueDateParameter({
  dueDate,
  dueDateInput,
  dueDateInputError,
  dueDateInputRef,
  calendarRef,
  isCalendarOpen,
  isTextInputOpen,
  onChangeDueDateInput,
  onOpenDueDateCalendar,
  onSaveDueDateInput,
  onSelectDueDate,
  onDueDateInputKeyDown,
  popup,
}: TaskDueDateParameterProps) {
  const today = new Date();
  const selectedDate = parseCalendarDate(dueDate) ?? today;

  return (
    <div className="min-w-0 flex-1" data-due-date-cell>
      {/* 日付を直接入力するためのテキスト入力 */}
      {isTextInputOpen ? (
        <Input
          aria-invalid={Boolean(dueDateInputError)}
          className="h-6 border-0 bg-background px-1 py-0 text-xs"
          inputMode="text"
          maxLength={10}
          onBlur={onSaveDueDateInput}
          onChange={onChangeDueDateInput}
          onKeyDown={onDueDateInputKeyDown}
          pattern="[0-9/]*"
          ref={dueDateInputRef}
          value={dueDateInput}
        />
      ) : (
        // カレンダーを開くための日付表示ボタン
        <button
          className="flex w-full min-w-0 rounded-sm bg-transparent px-0 text-left outline-none focus-visible:ring-[2px] focus-visible:ring-ring"
          onClick={(event) => onOpenDueDateCalendar(event.currentTarget)}
          onDoubleClick={(event) => event.stopPropagation()}
          style={{ backgroundColor: "transparent" }}
          type="button"
        >
          {/* 現在選択されている期日表示 */}
          <span className="truncate">
            {dueDate || formatCalendarDate(today)}
          </span>
        </button>
      )}
      {/* 日付入力が不正な場合のエラーメッセージ */}
      {isTextInputOpen && dueDateInputError ? (
        <div className="absolute z-50 mt-1 rounded-sm border bg-popover px-2 py-1 text-[11px] text-destructive shadow-sm">
          {dueDateInputError}
        </div>
      ) : null}
      {/* 期日を選択するためのカレンダーポップアップ */}
      {isCalendarOpen && popup ? (
        <div
          className="fixed z-50 rounded-md border bg-popover shadow-md"
          ref={calendarRef}
          style={{ left: popup.left, top: popup.top }}
        >
          {/* 単一の日付を選択するカレンダー本体 */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDueDate}
          />
        </div>
      ) : null}
    </div>
  );
}
