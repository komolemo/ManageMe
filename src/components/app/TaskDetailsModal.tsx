import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/components/app/SimpleTaskManager";
import { TagInput } from "@/components/app/TagInput";
import { useCreateProjectTask } from "@/hooks/useProject";
import { EditableName2 } from "./EditableName";
import type { ProjectTask } from "@/pages/projectData";

type TaskDetailsModalProps = {
  canAddSubtask?: boolean;
  canShowSubtasks?: boolean;
  isOpen: boolean;
  onAddSubtask?: (parentTaskId: ProjectTask["id"], subtask: ProjectTask) => void;
  onOpenChange: (isOpen: boolean) => void;
  onRegisterExistingParentTask?: (taskId: ProjectTask["id"], parentTask: ProjectTask) => void;
  onRegisterExistingSubtask?: (parentTaskId: ProjectTask["id"], subtask: ProjectTask) => void;
  parentTask?: ProjectTask | null;
  projectTasks?: ProjectTask[];
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
  onRegisterExistingParentTask,
  onRegisterExistingSubtask,
  parentTask,
  projectTasks = [],
  task,
}: TaskDetailsModalProps) {
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null
  );
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [details, setDetails] = useState("");
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState(fallbackStartDate);
  const [dueDate, setDueDate] = useState("");
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<ProjectTask[]>([]);
  const newSubtaskNameInputRef = useRef<HTMLInputElement>(null);
  const createSubtask = useCreateProjectTask(setSubtasks);

  useEffect(() => {
    setDetails(task?.details ?? "");
    setTaskName(task?.subject ?? "");
    setStartDate(fallbackStartDate);
    setDueDate(task?.dueDate ?? "");
    setAssignedTags(task?.tags ?? []);
    setSubtasks(canShowSubtasks ? task?.children ?? [] : []);
    if (newSubtaskNameInputRef.current) {
      newSubtaskNameInputRef.current.value = "";
    }
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

  const addSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canAddSubtask) {
      return;
    }

    const newSubtask = createSubtask({
      name: newSubtaskNameInputRef.current?.value ?? "",
      status: task?.status ?? "Not Started",
    });

    if (!newSubtask) {
      return;
    }

    if (task) {
      onAddSubtask?.(task.id, newSubtask);
    }
    if (newSubtaskNameInputRef.current) {
      newSubtaskNameInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden rounded-lg max-w-[540px] pt-[32px]"
        style={{ maxHeight: "min(540px, calc(100vh - 2rem))" }}
      >
        {task ? (
          <div
            className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-[4px] overflow-hidden"
            style={{ height: "calc(min(540px, calc(100vh - 2rem)))" }}
          >
            <DialogHeader className="px-[16px]">

            </DialogHeader>

            <div className="grid min-h-0 gap-[16px] overflow-x-hidden overflow-y-auto px-[16px]">
              <div className="flex items-start gap-[6px]">
                <Checkbox className="my-[8px]" />
                {/* <Input id="issue-detail-name" readOnly value={task.subject} /> */}
                <EditableName2
                  name={taskName}
                  onSaveEditing={setTaskName}
                  resetKey={task.id}
                />
              </div>
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

                <ParentTaskManager
                  existingTasks={projectTasks.filter(
                    (projectTask) => projectTask.id !== task.id
                  )}
                  onRegisterExistingTask={(existingTask) => {
                    if (!task) {
                      return;
                    }

                    onRegisterExistingParentTask?.(task.id, existingTask);
                  }}
                  task={parentTask}
                />

                {canShowSubtasks ? (
                  <SubTaskManager
                    canAddTask={canAddSubtask}
                    existingTasks={projectTasks.filter(
                      (projectTask) => projectTask.id !== task.id
                    )}
                    onAddTask={addSubtask}
                    onRegisterExistingTask={(existingTask) => {
                      if (!task) {
                        return;
                      }

                      onRegisterExistingSubtask?.(task.id, existingTask);
                    }}
                    taskNameInputRef={newSubtaskNameInputRef}
                    tasks={subtasks}
                  />
                ) : null}

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
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
