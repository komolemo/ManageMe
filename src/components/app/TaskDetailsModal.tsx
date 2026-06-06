import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link as LinkIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import { TagInput } from "@/components/app/TagInput";
import { useCreateProjectTask } from "@/hooks/useProject";
import { EditableName2 } from "./EditableName";
import type { ProjectTask } from "@/pages/projectData";

type TaskDetailsModalProps = {
  canAddSubtask?: boolean;
  canShowSubtasks?: boolean;
  isOpen: boolean;
  onAddSubtask?: (parentTaskId: string, subtask: ProjectTask) => void;
  onOpenChange: (isOpen: boolean) => void;
  parentTask?: ProjectTask | null;
  task: ProjectTask | null;
};

const bucketOptions = ["ph-1-0", "ph-1-1", "ph-1-2", "ph-1-3", "ph-1-4"];
const priorityOptions: ProjectTask["priority"][] = ["Low", "Medium", "High"];
type DateField = "start" | "due";
const fallbackStartDate = "2026/06/05";

export function TaskDetailsModal({
  canAddSubtask = true,
  canShowSubtasks = true,
  isOpen,
  onAddSubtask,
  onOpenChange,
  parentTask,
  task,
}: TaskDetailsModalProps) {
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null
  );
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [details, setDetails] = useState("");
  const [draftTaskName, setDraftTaskName] = useState("");
  const [startDate, setStartDate] = useState(fallbackStartDate);
  const [dueDate, setDueDate] = useState("");
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [isTaskNameEditing, setIsTaskNameEditing] = useState(false);
  const [subtasks, setSubtasks] = useState<ProjectTask[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const createSubtask = useCreateProjectTask(setSubtasks);

  useEffect(() => {
    setDetails(task?.details ?? "");
    setDraftTaskName(task?.subject ?? "");
    setStartDate(fallbackStartDate);
    setDueDate(task?.dueDate ?? "");
    setAssignedTags(task?.tags ?? []);
    setIsTaskNameEditing(false);
    setSubtasks(canShowSubtasks ? task?.children ?? [] : []);
    setNewSubtaskName("");
    setActiveDateField(null);
    setDatePopup(null);
  }, [canShowSubtasks, task]);

  const setDateValue = (field: DateField, value: string) => {
    if (field === "start") {
      setStartDate(value);
      return;
    }

    setDueDate(value);
  };

  const openDatePopup = (
    field: DateField,
    rect: DOMRect,
    mode: DueDatePopup["mode"]
  ) => {
    setActiveDateField(field);
    setDatePopup({
      taskId: `${task?.id ?? "task"}-${field}`,
      left: rect.left,
      top: rect.bottom + 6,
      mode,
    });
  };

  const closeDatePopup = () => {
    setActiveDateField(null);
    setDatePopup(null);
  };

  const saveTaskNameEditing = () => {
    setDraftTaskName((currentDraftTaskName) =>
      currentDraftTaskName.trim() || task?.subject || ""
    );
    setIsTaskNameEditing(false);
  };

  const cancelTaskNameEditing = () => {
    setDraftTaskName(task?.subject ?? "");
    setIsTaskNameEditing(false);
  };

  const addSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canAddSubtask) {
      return;
    }

    const newSubtask = createSubtask({
      idPrefix: `${task?.id ?? "task"}-subtask`,
      name: newSubtaskName,
      status: task?.status ?? "Not Started",
    });

    if (!newSubtask) {
      return;
    }

    if (task) {
      onAddSubtask?.(task.id, newSubtask);
    }
    setNewSubtaskName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[540px] overflow-y-auto rounded-lg max-w-[540px] p-[16px] pt-[32px]">
        {task ? (
          <div className="flex min-h-0 flex-col gap-[16px]">
            <DialogHeader>
              {/* <DialogTitle>Issue Details</DialogTitle> */}
              <div className="flex items-start gap-[6px]">
                <Checkbox className="my-[8px]" />
                {/* <Input id="issue-detail-name" readOnly value={task.subject} /> */}
                <EditableName2
                  draftName={draftTaskName}
                  isEditing={isTaskNameEditing}
                  name={task.subject}
                  onCancelEditing={cancelTaskNameEditing}
                  onDraftNameChange={setDraftTaskName}
                  onSaveEditing={saveTaskNameEditing}
                  onStartEditing={() => setIsTaskNameEditing(true)}
                />
              </div>
            </DialogHeader>

            <div className="grid min-h-0 gap-[16px] overflow-x-hidden overflow-y-auto pl-[4px]">
              <div className="grid content-start gap-[12px]">

                <div className="grid gap-[6px]">
                  <label className="font-medium text-[14px]" htmlFor="issue-detail-tags">
                    Tags
                  </label>
                  <TagInput
                    inputId="issue-detail-tags"
                    onChange={setAssignedTags}
                    value={assignedTags}
                  />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[12px]">
                  <div className="grid gap-[6px]">
                    <label className="font-medium text-[14px]" htmlFor="issue-detail-bucket">
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
                    <label className="font-medium text-[14px]" htmlFor="issue-detail-priority">
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
                    <label className="font-medium text-[14px]">
                      Start Date
                    </label>
                    <div
                      className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs"
                      data-date-field
                    >
                      <TaskDueDateParameter
                        calendarPlacement="inline"
                        isActive={activeDateField === "start"}
                        onClose={closeDatePopup}
                        onCommit={(date) => setDateValue("start", date)}
                        onOpen={(rect, mode) =>
                          openDatePopup("start", rect, mode)
                        }
                        popup={
                          activeDateField === "start" ? datePopup : null
                        }
                        value={startDate}
                      />
                    </div>
                  </div>

                  <div className="grid gap-[6px]">
                    <label className="ont-medium text-[14px]">
                      Due Date
                    </label>
                    <div
                      className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs"
                      data-date-field
                    >
                      <TaskDueDateParameter
                        calendarPlacement="inline"
                        isActive={activeDateField === "due"}
                        onClose={closeDatePopup}
                        onCommit={(date) => setDateValue("due", date)}
                        onOpen={(rect, mode) =>
                          openDatePopup("due", rect, mode)
                        }
                        popup={activeDateField === "due" ? datePopup : null}
                        value={dueDate}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-[6px]">
                  <label className="font-medium text-[14px]" htmlFor="issue-detail-description">
                    Description
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

                {parentTask ? (
                  <div className="grid gap-[6px]">
                    <div className="font-medium text-[14px]">Parent task</div>
                    <div className="border">
                      <div
                        className="grid min-h-[24px] items-center gap-[8px] px-[10px] py-[8px]"
                        style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
                      >
                        <Checkbox checked={parentTask.isFinished} />
                        <a
                          className="flex min-w-0 items-center gap-[6px] text-[14px] text-foreground underline-offset-4 hover:underline"
                          href={parentTask.wikiPageLink}
                        >
                          <LinkIcon className="size-3 shrink-0 text-muted-foreground" />
                          <span
                            className="block min-w-0 max-w-full flex-1 whitespace-normal"
                            style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
                          >
                            {parentTask.subject}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}

                {canShowSubtasks ? (
                <div className="grid gap-[6px]">
                  <div className="font-medium text-[14px]">Subtasks</div>
                  <div className="divide-y grid gap-[4px]">
                    {subtasks.map((subtask) => (
                      <div
                        className="grid min-h-[24px] items-center gap-[8px] pb-[4px] border-b"
                        key={subtask.id}
                        style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
                      >
                        <Checkbox checked={subtask.isFinished} />
                        <a
                          className="flex min-w-0 items-center gap-[6px] text-[14px] text-foreground underline-offset-4 hover:underline"
                          href={subtask.wikiPageLink}
                        >
                          <LinkIcon className="size-3 shrink-0 text-muted-foreground" />
                          <span
                            className="block min-w-0 max-w-full flex-1 whitespace-normal"
                            style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
                          >
                            {subtask.subject}
                          </span>
                        </a>
                      </div>
                      ))}
                    {canAddSubtask ? (
                      <form
                        className="grid min-h-[36px] items-center gap-[8px] border-0"
                        onSubmit={addSubtask}
                        style={{ gridTemplateColumns: "20px minmax(0, 1fr)" }}
                      >
                        <Checkbox disabled />
                        <label className="sr-only" htmlFor="issue-detail-new-subtask">
                          Subtask name
                        </label>
                        <Input
                          className="h-[26px] border-0 px-[0px] py-[0px] focus-visible:ring-0"
                          id="issue-detail-new-subtask"
                          onChange={(event) => setNewSubtaskName(event.target.value)}
                          placeholder="Add subtask"
                          value={newSubtaskName}
                        />
                      </form>
                    ) : null}
                  </div>
                </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
