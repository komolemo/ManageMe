import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Link as LinkIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCalendarDate,
  TaskDueDateParameter,
  toDateInputValue,
  validateDateInput,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import type { ProjectTask } from "@/pages/projectData";

type TaskDetailsModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: ProjectTask | null;
};

const bucketOptions = ["ph-1-0", "ph-1-1", "ph-1-2", "ph-1-3", "ph-1-4"];
const priorityOptions: ProjectTask["priority"][] = ["Low", "Medium", "High"];
type DateField = "start" | "due";
const fallbackStartDate = "2026/06/05";

export function TaskDetailsModal({
  isOpen,
  onOpenChange,
  task,
}: TaskDetailsModalProps) {
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null
  );
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [dateInput, setDateInput] = useState("");
  const [dateInputError, setDateInputError] = useState("");
  const [startDate, setStartDate] = useState(fallbackStartDate);
  const [dueDate, setDueDate] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const subtasks = task?.children ?? [];

  useEffect(() => {
    setStartDate(fallbackStartDate);
    setDueDate(task?.dueDate ?? "");
    setActiveDateField(null);
    setDatePopup(null);
    setDateInput("");
    setDateInputError("");
  }, [task]);

  const getDateValue = (field: DateField) =>
    field === "start" ? startDate : dueDate;

  const setDateValue = (field: DateField, value: string) => {
    if (field === "start") {
      setStartDate(value);
      return;
    }

    setDueDate(value);
  };

  const openDateCalendar = (field: DateField, button: HTMLButtonElement) => {
    const rect =
      button.closest("[data-date-field]")?.getBoundingClientRect() ??
      button.getBoundingClientRect();
    const dialogRect = button
      .closest('[data-slot="dialog-content"]')
      ?.getBoundingClientRect();
    const nextMode =
      activeDateField === field && datePopup?.mode === "calendar"
        ? "text"
        : "calendar";

    setActiveDateField(field);
    setDateInput(toDateInputValue(getDateValue(field)));
    setDateInputError("");
    setDatePopup({
      taskId: `${task?.id ?? "task"}-${field}`,
      left: dialogRect ? rect.left - dialogRect.left : rect.left,
      top: dialogRect ? rect.bottom - dialogRect.top + 6 : rect.bottom + 6,
      mode: nextMode,
    });
  };

  const selectDate = (field: DateField, date?: Date) => {
    if (!date) {
      return;
    }

    setDateValue(field, formatCalendarDate(date));
    setDatePopup(null);
  };

  const changeDateInput = (event: ChangeEvent<HTMLInputElement>) => {
    setDateInput(toDateInputValue(event.target.value));
    setDateInputError("");
  };

  const saveDateInput = (field: DateField) => {
    const validatedDate = validateDateInput(dateInput);

    if (!validatedDate) {
      setDateInputError("Enter a valid date as YYYY/MM/DD");
      return;
    }

    setDateValue(field, validatedDate);
    setDatePopup(null);
  };

  const handleDateInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    field: DateField
  ) => {
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
      saveDateInput(field);
    }

    if (event.key === "Escape") {
      setDatePopup(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[540px] overflow-y-auto max-w-[540px] p-[16px] pt-[32px]">
        {task ? (
          <div className="flex min-h-0 flex-col gap-[16px]">
            <DialogHeader>
              {/* <DialogTitle>Issue Details</DialogTitle> */}
              <div className="grid gap-[6px]">
                <Input id="issue-detail-name" readOnly value={task.subject} />
              </div>
            </DialogHeader>

            <div className="grid min-h-0 gap-[16px]  overflow-x-hidden overflow-y-auto pr-[4px]">
              <div className="grid content-start gap-[12px]">

                <div className="grid gap-[6px]">
                  <label className="text-xs font-medium" htmlFor="issue-detail-tags">
                    Tags
                  </label>
                  <Input
                    className="border-0 px-[12px] py-[8px]"
                    id="issue-detail-tags"
                    readOnly
                    value={task.tags.join(", ")}
                  />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[12px]">
                  <div className="grid gap-[6px]">
                    <label className="text-xs font-medium text-[14px]" htmlFor="issue-detail-bucket">
                      Bucket
                    </label>
                    <Select value={task.milestone || bucketOptions[0]}>
                      <SelectTrigger className="w-full border-0 px-[12px] py-[8px]" id="issue-detail-bucket">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bucketOptions.map((bucketOption) => (
                          <SelectItem key={bucketOption} value={bucketOption}>
                            {bucketOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-[6px]">
                    <label className="text-xs font-medium text-[14px]" htmlFor="issue-detail-priority">
                      Priority
                    </label>
                    <Select value={task.priority}>
                      <SelectTrigger className="w-full border-0 px-[12px] py-[8px]" id="issue-detail-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priorityOption) => (
                          <SelectItem key={priorityOption} value={priorityOption}>
                            {priorityOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[12px]">
                  <div className="grid gap-[6px]">
                    <label className="text-xs font-medium text-[14px]">
                      Start Date
                    </label>
                    <div
                      className="flex h-8 w-full min-w-[144px] items-center bg-background px-[12px] py-[8px] text-xs"
                      data-date-field
                    >
                      <TaskDueDateParameter
                        calendarRef={calendarRef}
                        dueDate={startDate}
                        dueDateInput={activeDateField === "start" ? dateInput : ""}
                        dueDateInputError={
                          activeDateField === "start" ? dateInputError : ""
                        }
                        dueDateInputRef={dateInputRef}
                        isCalendarOpen={
                          activeDateField === "start" &&
                          datePopup?.mode === "calendar"
                        }
                        isTextInputOpen={
                          activeDateField === "start" &&
                          datePopup?.mode === "text"
                        }
                        onChangeDueDateInput={changeDateInput}
                        onDueDateInputKeyDown={(event) =>
                          handleDateInputKeyDown(event, "start")
                        }
                        onOpenDueDateCalendar={(button) =>
                          openDateCalendar("start", button)
                        }
                        onSaveDueDateInput={() => saveDateInput("start")}
                        onSelectDueDate={(date) => selectDate("start", date)}
                        popup={
                          activeDateField === "start" ? datePopup : null
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-[6px]">
                    <label className="text-xs font-medium text-[14px]">
                      Due Date
                    </label>
                    <div
                      className="flex h-8 w-full min-w-[144px] items-center bg-background px-[12px] py-[8px] text-xs"
                      data-date-field
                    >
                      <TaskDueDateParameter
                        calendarRef={calendarRef}
                        dueDate={dueDate}
                        dueDateInput={activeDateField === "due" ? dateInput : ""}
                        dueDateInputError={
                          activeDateField === "due" ? dateInputError : ""
                        }
                        dueDateInputRef={dateInputRef}
                        isCalendarOpen={
                          activeDateField === "due" &&
                          datePopup?.mode === "calendar"
                        }
                        isTextInputOpen={
                          activeDateField === "due" &&
                          datePopup?.mode === "text"
                        }
                        onChangeDueDateInput={changeDateInput}
                        onDueDateInputKeyDown={(event) =>
                          handleDateInputKeyDown(event, "due")
                        }
                        onOpenDueDateCalendar={(button) =>
                          openDateCalendar("due", button)
                        }
                        onSaveDueDateInput={() => saveDateInput("due")}
                        onSelectDueDate={(date) => selectDate("due", date)}
                        popup={activeDateField === "due" ? datePopup : null}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-[6px]">
                  <label className="text-xs font-medium" htmlFor="issue-detail-description">
                    Description
                  </label>
                  <textarea
                    className="px-[12px] py-[8px] min-h-[112px] w-full resize-none rounded-none border border-input bg-transparent text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
                    id="issue-detail-description"
                    readOnly
                    value={task.details}
                  />
                </div>

                <div className="grid gap-[6px]">
                  <div className="text-xs font-medium">Subtasks</div>
                  <div className="divide-y border">
                    {subtasks.length > 0 ? (
                      subtasks.map((subtask) => (
                        <div
                          className="grid min-h-[36px] items-center gap-[8px] px-[10px] py-[8px]"
                          key={subtask.id}
                          style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
                        >
                          <Checkbox checked={subtask.isFinished} />
                          <a
                            className="flex min-w-0 items-center gap-[6px] text-xs text-foreground underline-offset-4 hover:underline"
                            href={subtask.wikiPageLink}
                          >
                            <LinkIcon className="size-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{subtask.subject}</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="px-[10px] py-[9px] text-xs text-muted-foreground">
                        No subtasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
