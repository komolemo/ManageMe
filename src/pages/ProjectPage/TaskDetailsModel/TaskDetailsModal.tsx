import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ModalXButton } from "@/components/app/XButton";
import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/pages/ProjectPage/ModalTaskManager";
import { TaskModalTag } from "./TaskModalParts/TaskModalTag";
import { TaskModalBucket } from "./TaskModalParts/TaskModalBucket";
import { TaskModalPriority } from "./TaskModalParts/TaskModalPriority";
import { TaskModalMilestone } from "./TaskModalParts/TaskModalMilestone";
import { MenuButton } from "@/components/app/MenuButton";
import { useCreateProjectTask } from "@/hooks/useProject";
import { EditableName2 } from "@/components/app/EditableName";
import type { ProjectBucket, ProjectMilestone, ProjectTask } from "@/features/task/projectTypes";
import { useTranslation } from "react-i18next";

type TaskDetailsModalProps = {
  buckets: ProjectBucket[];
  canAddSubtask?: boolean;
  canShowSubtasks?: boolean;
  isOpen: boolean;
  milestones: ProjectMilestone[];
  onAddSubtask?: (parentTaskId: ProjectTask["id"], subtask: ProjectTask) => void;
  onOpenChange: (isOpen: boolean) => void;
  onOpenInNewTab: (task: ProjectTask) => void;
  onRegisterExistingParentTask?: (taskId: ProjectTask["id"], parentTask: ProjectTask) => void;
  onRegisterExistingSubtask?: (parentTaskId: ProjectTask["id"], subtask: ProjectTask) => void;
  parentTask?: ProjectTask | null;
  projectTasks?: ProjectTask[];
  task: ProjectTask | null;
};

type DateField = "start" | "due";
const fallbackStartDate = "2026/06/05";

export function TaskDetailsModal({
  buckets,
  canAddSubtask = true,
  canShowSubtasks = true,
  isOpen,
  milestones,
  onAddSubtask,
  onOpenChange,
  onOpenInNewTab,
  onRegisterExistingParentTask,
  onRegisterExistingSubtask,
  parentTask,
  projectTasks = [],
  task,
}: TaskDetailsModalProps) {
  const { t } = useTranslation();
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null
  );
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [details, setDetails] = useState("");
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState(fallbackStartDate);
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<ProjectTask[]>([]);
  const newSubtaskNameInputRef = useRef<HTMLInputElement>(null);
  const createSubtask = useCreateProjectTask(setSubtasks);

  useEffect(() => {
    setDetails(task?.details ?? "");
    setTaskName(task?.subject ?? "");
    setStartDate(fallbackStartDate);
    setDueDate(task?.dueDate ?? "");
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
        className="w-[calc(100%-2rem)] max-w-[640px] overflow-hidden rounded-lg sm:max-w-[640px] p-0"
        showCloseButton={false}
        style={{ maxHeight: "min(540px, calc(100vh - 2rem))" }}
      >
        {task ? (
          <div
            className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1 overflow-hidden"
            style={{ height: "calc(min(540px, calc(100vh - 2rem)))" }}
          >
            <DialogHeader className="flex-row items-center justify-end px-0">
              <MenuButton
                actions={[
                  {
                    label: t("common.openInNewTab"),
                    onSelect: () => onOpenInNewTab(task),
                  },
                  { label: t("common.copyLink") },
                  { label: t("common.deleteTask") },
                ]}
                ariaLabel={t("task.openMenu")}
              />
              <DialogClose asChild>
                <ModalXButton label={t("common.close")} />
              </DialogClose>
            </DialogHeader>

            <div className="grid min-h-0 gap-4 overflow-x-hidden overflow-y-auto px-4">
              <div className="flex items-start gap-[6px]">
                <Checkbox className="my-[8px]" />
                {/* <Input id="issue-detail-name" readOnly value={task.subject} /> */}
                <EditableName2
                  name={taskName}
                  onSaveEditing={setTaskName}
                  resetKey={task.id}
                />
              </div>
              <div className="grid content-start gap-3">
                {/* タグ項目 */}
                <TaskModalTag task={task} />

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  {/* バケット項目 */}
                  <TaskModalBucket buckets={buckets} task={task} />
                  {/* 優先度項目 */}
                  <TaskModalPriority priority={task.priority} />
                </div>

                {/* マイルストン項目 */}
                <TaskModalMilestone milestones={milestones} task={task} />

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="grid gap-[6px]">
                    <label className="font-medium text-[14px]">
                      {t("task.startDate")}
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
                      {t("task.dueDate")}
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
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
