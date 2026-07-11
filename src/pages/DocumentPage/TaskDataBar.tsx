import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  ParentTaskManager,
  SubTaskManager,
} from "@/components/app/SimpleTaskManager";
import { TagInput } from "@/components/app/TagInput";
import { Input } from "@/components/ui/input";
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
  const [areTaskRelationsExpanded, setAreTaskRelationsExpanded] =
    useState(false);
  const RelationsIcon = areTaskRelationsExpanded
    ? ChevronDown
    : ChevronRight;

  return (
    <div className="grid gap-4 mb-3 mx-2">
      <section className="grid gap-[6px]">
        <TagInput
          inputId="document-task-tags"
          onChange={setTags}
          value={tags}
        />
      </section>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left [&_td:not(:last-child)]:pr-2 [&_th:not(:last-child)]:pr-2">
          <thead>
            <tr className="border-b">
              {['Bucket', 'Priority', 'Milestone', 'Start Date', 'Due Date'].map((label) => (
                <th className=" py-1 text-[14px] font-medium" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">
                <Select onValueChange={setBucket} value={bucket}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Bucket" /></SelectTrigger>
                  <SelectContent>
                    {buckets.map((bucket) => <SelectItem key={bucket.id} value={bucket.name}>{bucket.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-2">
                <Select onValueChange={(value) => setPriority(value as ProjectTask["priority"])} value={priority}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-2">
                <Select onValueChange={setMilestone} value={milestone}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Milestone" /></SelectTrigger>
                  <SelectContent>
                    {milestones.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-2">
                <Input aria-label="Start Date" onChange={(event) => setStartDate(event.target.value)} value={startDate} />
              </td>
              <td className="py-2">
                <Input aria-label="Due Date" onChange={(event) => setDueDate(event.target.value)} value={dueDate} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
          <div className="grid gap-4">
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
