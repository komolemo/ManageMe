import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
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
import { useTranslation } from "react-i18next";
import { taskPriorityLabels } from "@/features/task/taskPriority";

export type DueDatePopup = {
  taskId: string | ProjectTask["id"];
  left: number;
  top: number;
  mode: "calendar" | "text";
};

const priorityOptions: ProjectTask["priority"][] = [...taskPriorityLabels];

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
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {/* 選択中のステータスを管理するラジオグループ */}
        <DropdownMenuRadioGroup onValueChange={onSelectStatus} value={status}>
          {boardStatuses.map((statusOption) => (
            // ステータス候補ごとの選択項目
            <DropdownMenuRadioItem className="text-[14px] p-[4px] gap-[4px]" key={statusOption} value={statusOption}>
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
  const { t } = useTranslation();
  const priorityColors: Record<ProjectTask["priority"], string> = {
    Low: "text-[#3ab54a]",
    Medium: "text-[#f59e0b]",
    High: "text-[#ef4444]",
    Emergency: "text-[#dc2626]",
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      {/* 優先度メニューを開くためのセル内ボタン */}
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full min-w-0 rounded-sm px-0 text-left border-0 focus-visible:ring-[2px] focus-visible:ring-ring"
          onDoubleClick={(event) => event.stopPropagation()}
          style={{ backgroundColor: "transparent" }}
          type="button"
        >
          {/* 現在選択されている優先度バッジ */}
          <Badge className={`${priorityColors[priority] || ""} bg-transparent font-[800]`}>
            {t(`task.priorityValues.${priority}`)}
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
              {t(`task.priorityValues.${priorityOption}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type TaskDueDateParameterProps = {
  calendarPlacement?: "fixed" | "inline";
  isActive: boolean;
  onClose: () => void;
  onCommit: (date: string) => void;
  onOpen: (rect: DOMRect, mode: DueDatePopup["mode"]) => void;
  popup: DueDatePopup | null;
  value: string;
};

export function TaskDueDateParameter({
  calendarPlacement = "fixed",
  isActive,
  onClose,
  onCommit,
  onOpen,
  popup,
  value,
}: TaskDueDateParameterProps) {
  const [dateInput, setDateInput] = useState("");
  const [dateInputError, setDateInputError] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = new Date();
  const displayValue = value || formatCalendarDate(today);
  const isCalendarOpen = isActive && popup?.mode === "calendar";
  const isTextInputOpen = isActive && popup?.mode === "text";
  const selectedDate = parseCalendarDate(value) ?? today;

  useEffect(() => {
    if (!isTextInputOpen) {
      return;
    }

    setDateInput(toDateInputValue(displayValue));
    setDateInputError("");
    requestAnimationFrame(() => {
      dateInputRef.current?.focus();
      dateInputRef.current?.select();
    });
  }, [displayValue, isTextInputOpen]);

  useEffect(() => {
    if (!isCalendarOpen && !isTextInputOpen) {
      return;
    }

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("[data-due-date-cell]")) {
        return;
      }

      onClose();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
    };
  }, [isCalendarOpen, isTextInputOpen, onClose]);

  const openDatePopup = (button: HTMLButtonElement) => {
    const rect =
      button.closest("[data-date-field]")?.getBoundingClientRect() ??
      button.getBoundingClientRect();
    const mode = isCalendarOpen ? "text" : "calendar";

    onOpen(rect, mode);
  };

  const commitDateInput = () => {
    const validatedDate = validateDateInput(dateInput);

    if (!validatedDate) {
      setDateInputError("YYYY/MM/DD の有効な日付を入力してください");
      return;
    }

    onCommit(validatedDate);
    onClose();
  };

  const selectDate = (date?: Date) => {
    if (!date) {
      return;
    }

    onCommit(formatCalendarDate(date));
    onClose();
  };
  const calendarContent = (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={selectDate}
    />
  );

  const handleDateInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !/^[\d/]$/.test(event.key)
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      commitDateInput();
    }

    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="relative min-w-0 flex-1" data-due-date-cell>
      {/* 日付を直接入力するためのテキスト入力 */}
      {isTextInputOpen ? (
        <Input
          aria-invalid={Boolean(dateInputError)}
          className="h-6 border-0 bg-background px-1 py-0 text-xs"
          inputMode="text"
          maxLength={10}
          onBlur={commitDateInput}
          onChange={(event) => {
            setDateInput(toDateInputValue(event.target.value));
            setDateInputError("");
          }}
          onKeyDown={handleDateInputKeyDown}
          pattern="[0-9/]*"
          ref={dateInputRef}
          value={dateInput}
        />
      ) : (
        // カレンダーを開くための日付表示ボタン
        <button
          className="flex w-full min-w-0 rounded-sm bg-transparent text-foreground px-0 text-left border-0 focus-visible:ring-[2px] focus-visible:ring-ring"
          onClick={(event) => openDatePopup(event.currentTarget)}
          onDoubleClick={(event) => event.stopPropagation()}
          style={{ backgroundColor: "transparent" }}
          type="button"
        >
          {/* 現在選択されている期日表示 */}
          <span className="truncate">
            {displayValue}
          </span>
        </button>
      )}
      {/* 日付入力が不正な場合のエラーメッセージ */}
      {isTextInputOpen && dateInputError ? (
        <div className="absolute z-50 mt-1 rounded-sm border bg-popover px-2 py-1 text-[11px] text-destructive shadow-sm">
          {dateInputError}
        </div>
      ) : null}
      {/* 期日を選択するためのカレンダーポップアップ */}
      {false ? (
        <div className="hidden">
          {/* 単一の日付を選択するカレンダー本体 */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={selectDate}
          />
        </div>
      ) : null}
      {isCalendarOpen && popup && calendarPlacement === "inline" ? (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[70] rounded-md border bg-popover shadow-md"
          data-due-date-cell
          ref={calendarRef}
        >
          {calendarContent}
        </div>
      ) : null}
      {isCalendarOpen &&
      popup &&
      calendarPlacement === "fixed" &&
      typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[70] rounded-md border bg-popover shadow-md"
              data-due-date-cell
              ref={calendarRef}
              style={{ left: popup.left, top: popup.top }}
            >
              {calendarContent}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
