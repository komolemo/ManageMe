import { useState } from "react";
import { ChevronDown, ChevronRight, KanbanSquare, LayoutGrid } from "lucide-react";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/pages/ProjectPage/ModalTaskManager";
import { Button } from "@/components/ui/button";
import {
  TaskDueDateParameter,
  type DueDatePopup,
} from "@/components/app/TaskParameters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { ProjectBoardView } from "@/pages/ProjectPage/ProjectBoardView/ProjectBoardView";
import { TaskDetailsModal } from "@/pages/ProjectPage/TaskDetailsModel/TaskDetailsModal";
import type { ProjectTask, ProjectTaskId } from "@/features/task/projectTypes";
import { useTranslation } from "react-i18next";
import { taskPriorityLabels } from "@/features/task/taskPriority";

const priorities: ProjectTask["priority"][] = [...taskPriorityLabels];
type DateField = "start" | "due";

const ignoreBoardTaskOpen = () => undefined;

function findParentTask(
  tasks: ProjectTask[],
  taskId: ProjectTaskId,
  parentTask: ProjectTask | null = null,
): ProjectTask | null {
  for (const task of tasks) {
    if (task.id === taskId) {
      return parentTask;
    }

    const parent = findParentTask(task.children ?? [], taskId, task);

    if (parent) {
      return parent;
    }
  }

  return null;
}

type TaskDataBarProps = {
  onOpenTaskInNewTab?: (task: ProjectTask) => void;
  taskId: ProjectTaskId;
};

export function TaskDataBar({
  onOpenTaskInNewTab = ignoreBoardTaskOpen,
  taskId,
}: TaskDataBarProps) {
  const { t } = useTranslation();
  const {
    addSubtask,
    bucket,
    buckets,
    dueDate,
    existingTasks,
    milestone,
    milestones,
    newSubtaskNameInputRef,
    parentTask,
    priority,
    projectTasks,
    registerSubtask,
    setBucket,
    setDueDate,
    setMilestone,
    setParentTask,
    setPriority,
    setStartDate,
    startDate,
    subtasks,
  } = useTasks({ taskId });
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [isTaskDataExpanded, setIsTaskDataExpanded] = useState(false);
  const [isTaskBoardView, setIsTaskBoardView] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [areTaskRelationsExpanded, setAreTaskRelationsExpanded] =
    useState(false);
  const TaskDataIcon = isTaskDataExpanded ? ChevronDown : ChevronRight;
  const RelationsIcon = areTaskRelationsExpanded
    ? ChevronDown
    : ChevronRight;
  const closeDatePopup = () => {
    setActiveDateField(null);
    setDatePopup(null);
  };
  const toggleTaskData = () => {
    if (isTaskDataExpanded) {
      closeDatePopup();
    }

    setIsTaskDataExpanded((isExpanded) => !isExpanded);
  };
  const openDatePopup = (
    field: DateField,
    rect: DOMRect,
    mode: DueDatePopup["mode"],
  ) => {
    setActiveDateField(field);
    setDatePopup({
      taskId: `${taskId}-${field}`,
      left: rect.left,
      mode,
      top: rect.bottom + 6,
    });
  };
  const taskViewButtons = (
    <div className="flex gap-1">
      <Button
        aria-label={t("taskData.showGrid")}
        aria-pressed={!isTaskBoardView}
        className="size-7 rounded-sm border-0"
        onClick={() => setIsTaskBoardView(false)}
        size="icon-sm"
        type="button"
        variant={!isTaskBoardView ? "secondary" : "ghost"}
      >
        <LayoutGrid aria-hidden className="size-4" />
      </Button>
      <Button
        aria-label={t("taskData.showBoard")}
        aria-pressed={isTaskBoardView}
        className="size-7 rounded-sm border-0"
        onClick={() => setIsTaskBoardView(true)}
        size="icon-sm"
        type="button"
        variant={isTaskBoardView ? "secondary" : "ghost"}
      >
        <KanbanSquare aria-hidden className="size-4" />
      </Button>
    </div>
  );

  return (
    <div className="grid gap-4 mb-3 mx-1 p-2 border rounded-md shadow-lg">
      <section className="grid gap-3">
        <button
          aria-expanded={isTaskDataExpanded}
          className="flex items-center gap-1 border-0 bg-transparent p-0 text-left text-[14px] font-medium"
          onClick={toggleTaskData}
          type="button"
        >
          <TaskDataIcon aria-hidden className="size-4" />
          {t("taskData.title")}
        </button>
        {isTaskDataExpanded ? (
          <div className="grid gap-3 ml-5">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <div className="grid gap-[6px]">
                <label className="font-medium text-[14px]" htmlFor="document-task-bucket">
                  {t("taskData.bucket")}
                </label>
                <Select onValueChange={setBucket} value={bucket || buckets[0]?.name}>
                  <SelectTrigger className="w-full border-0 px-3 py-2" id="document-task-bucket">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map((bucketOption) => (
                      <SelectItem key={bucketOption.id} value={bucketOption.name}>
                        {bucketOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-[6px]">
                <label className="font-medium text-[14px]" htmlFor="document-task-priority">
                  {t("taskData.priority")}
                </label>
                <Select
                  onValueChange={(value) => setPriority(value as ProjectTask["priority"])}
                  value={priority}
                >
                  <SelectTrigger className="w-full border-0 px-3 py-2" id="document-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priorityOption) => (
                      <SelectItem key={priorityOption} value={priorityOption}>
                        {t(`task.priorityValues.${priorityOption}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-[6px]">
              <label className="font-medium text-[14px]" htmlFor="document-task-milestone">
                {t("taskData.milestone")}
              </label>
              <Select onValueChange={setMilestone} value={milestone || milestones[0]?.name}>
                <SelectTrigger className="w-full border-0 px-3 py-2" id="document-task-milestone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map((milestoneOption) => (
                    <SelectItem key={milestoneOption.id} value={milestoneOption.name}>
                      {milestoneOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <div className="grid gap-[6px]">
                <label className="font-medium text-[14px]">{t("taskData.startDate")}</label>
                <div className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs" data-date-field>
                  <TaskDueDateParameter
                    calendarPlacement="inline"
                    isActive={activeDateField === "start"}
                    onClose={closeDatePopup}
                    onCommit={setStartDate}
                    onOpen={(rect, mode) => openDatePopup("start", rect, mode)}
                    popup={activeDateField === "start" ? datePopup : null}
                    value={startDate}
                  />
                </div>
              </div>
              <div className="grid gap-[6px]">
                <label className="font-medium text-[14px]">{t("taskData.dueDate")}</label>
                <div className="flex h-8 items-center bg-background px-[8px] py-[8px] text-xs" data-date-field>
                  <TaskDueDateParameter
                    calendarPlacement="inline"
                    isActive={activeDateField === "due"}
                    onClose={closeDatePopup}
                    onCommit={setDueDate}
                    onOpen={(rect, mode) => openDatePopup("due", rect, mode)}
                    popup={activeDateField === "due" ? datePopup : null}
                    value={dueDate}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3">
        <button
          aria-expanded={areTaskRelationsExpanded}
          className="flex items-center gap-1 border-0 bg-transparent p-0 text-left text-[14px] font-medium"
          onClick={() =>
            setAreTaskRelationsExpanded((isExpanded) => !isExpanded)
          }
          type="button"
        >
          <RelationsIcon aria-hidden className="size-4" />
          {t("taskData.relationships")}
        </button>
        {areTaskRelationsExpanded ? (
          <div className="grid gap-4 ml-5">
            <ParentTaskManager
              existingTasks={existingTasks}
              onRegisterExistingTask={setParentTask}
              onOpenTaskDetails={setSelectedTask}
              onOpenTaskInNewTab={onOpenTaskInNewTab}
              task={parentTask}
            />
            <div className="grid gap-3">
              {!isTaskBoardView ? (
                <SubTaskManager
                  canAddTask
                  existingTasks={existingTasks}
                  onAddTask={addSubtask}
                  onRegisterExistingTask={registerSubtask}
                  onOpenTaskDetails={setSelectedTask}
                  onOpenTaskInNewTab={onOpenTaskInNewTab}
                  taskNameInputRef={newSubtaskNameInputRef}
                  tasks={subtasks}
                  titleActions={taskViewButtons}
                />
              ) : (
                <div className="grid gap-[6px]">
                  <div className="flex items-center gap-1">
                    <div className="font-medium text-[14px]">{t("taskData.subtasks")}</div>
                    {taskViewButtons}
                  </div>
                  <div className="h-[420px] min-w-0 overflow-hidden">
                    <ProjectBoardView
                      buckets={buckets}
                      grouping="progress"
                      onOpenTaskDetails={setSelectedTask}
                      onOpenTaskInNewTab={onOpenTaskInNewTab}
                      tasks={subtasks}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
      <TaskDetailsModal
        buckets={buckets}
        canAddSubtask={false}
        isOpen={Boolean(selectedTask)}
        milestones={milestones}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedTask(null);
          }
        }}
        onOpenInNewTab={ignoreBoardTaskOpen}
        parentTask={
          selectedTask
            ? findParentTask(projectTasks, selectedTask.id)
            : null
        }
        projectTasks={projectTasks}
        task={selectedTask}
      />
    </div>
  );
}
