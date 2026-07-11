import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/components/app/SimpleTaskManager";
import { TagInput } from "@/components/app/TagInput";
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
import type { ProjectTask, ProjectTaskId } from "@/pages/projectData";

const priorities: ProjectTask["priority"][] = ["Low", "Medium", "High"];
type DateField = "start" | "due";

type TaskDataBarProps = {
  taskId: ProjectTaskId;
};

export function TaskDataBar({ taskId }: TaskDataBarProps) {
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
    registerSubtask,
    setBucket,
    setDueDate,
    setMilestone,
    setParentTask,
    setPriority,
    setStartDate,
    setTags,
    startDate,
    subtasks,
    tags,
  } = useTasks({ taskId });
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [datePopup, setDatePopup] = useState<DueDatePopup | null>(null);
  const [isTaskDataExpanded, setIsTaskDataExpanded] = useState(false);
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

  return (
    <div className="grid gap-4 mb-3 mx-2">
      <section className="grid gap-[6px]">
        <TagInput
          inputId="document-task-tags"
          onChange={setTags}
          value={tags}
        />
      </section>

      <section className="grid gap-3">
        <button
          aria-expanded={isTaskDataExpanded}
          className="flex items-center gap-1 border-0 bg-transparent p-0 text-left text-[14px] font-medium"
          onClick={toggleTaskData}
          type="button"
        >
          <TaskDataIcon aria-hidden className="size-4" />
          Task Data
        </button>
        {isTaskDataExpanded ? (
          <div className="grid gap-3 ml-5">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <div className="grid gap-[6px]">
                <label className="font-medium text-[14px]" htmlFor="document-task-bucket">
                  Bucket
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
                  Priority
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
                        {priorityOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-[6px]">
              <label className="font-medium text-[14px]" htmlFor="document-task-milestone">
                Milestone
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
                <label className="font-medium text-[14px]">Start Date</label>
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
                <label className="font-medium text-[14px]">Due Date</label>
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
          Task relationships
        </button>
        {areTaskRelationsExpanded ? (
          <div className="grid gap-4 ml-5">
            <ParentTaskManager
              existingTasks={existingTasks}
              onRegisterExistingTask={setParentTask}
              task={parentTask}
            />
            <SubTaskManager
              canAddTask
              existingTasks={existingTasks}
              onAddTask={addSubtask}
              onRegisterExistingTask={registerSubtask}
              taskNameInputRef={newSubtaskNameInputRef}
              tasks={subtasks}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
