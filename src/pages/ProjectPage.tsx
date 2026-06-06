import { useMemo, useState } from "react";
import { KanbanSquare, LayoutGrid, Settings } from "lucide-react";
import { EditableName1 } from "@/components/app/EditableName";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchForm } from "@/components/app/SearchForm";
import { TaskDetailsModal } from "@/components/app/TaskDetailsModal";
import { PageShell } from "@/pages/PageShell";
import { ProjectBoardView } from "@/pages/ProjectBoardView/ProjectBoardView";
import { ProjectGridView } from "@/pages/ProjectGridView/ProjectGridView";
import { tasks as initialTasks, type ProjectTask } from "@/pages/projectData";
import type { PageKey } from "@/pages/pageTypes";

type ProjectViewMode = "grid" | "board";
type ProjectGrouping = "progress" | "bucket";

type ProjectPageProps = {
  onNavigate: (page: PageKey) => void;
  onSearchTag: (tag: string) => void;
};

export function ProjectPage({ onNavigate, onSearchTag }: ProjectPageProps) {
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");
  const [grouping, setGrouping] = useState<ProjectGrouping>("progress");
  const [projectName, setProjectName] = useState("Project Page");
  const [draftProjectName, setDraftProjectName] = useState(projectName);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  const openTaskDetails = (task: ProjectTask) => {
    setSelectedTask(task);
  };

  const changeTaskDetailsOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTask(null);
    }
  };

  const getTaskDepth = (
    taskId: string,
    currentTasks: ProjectTask[],
    currentDepth = 0
  ): number | null => {
    for (const task of currentTasks) {
      if (task.id === taskId) {
        return currentDepth;
      }

      if (task.children?.length) {
        const childDepth = getTaskDepth(
          taskId,
          task.children,
          currentDepth + 1
        );

        if (childDepth !== null) {
          return childDepth;
        }
      }
    }

    return null;
  };

  const getParentTask = (
    taskId: string,
    currentTasks: ProjectTask[],
    parentTask: ProjectTask | null = null
  ): ProjectTask | null => {
    for (const task of currentTasks) {
      if (task.id === taskId) {
        return parentTask;
      }

      if (task.children?.length) {
        const foundParentTask = getParentTask(taskId, task.children, task);

        if (foundParentTask) {
          return foundParentTask;
        }
      }
    }

    return null;
  };

  const selectedTaskDepth = useMemo(
    () =>
      selectedTask
        ? getTaskDepth(selectedTask.id, projectTasks)
        : null,
    [projectTasks, selectedTask]
  );
  const canAddSubtaskToSelectedTask =
    selectedTaskDepth === null || selectedTaskDepth < 2;
  const canShowSubtasksForSelectedTask =
    selectedTaskDepth === null || selectedTaskDepth < 2;
  const selectedTaskParent = useMemo(
    () =>
      selectedTask
        ? getParentTask(selectedTask.id, projectTasks)
        : null,
    [projectTasks, selectedTask]
  );

  const addSubtaskToProject = (
    parentTaskId: string,
    subtask: ProjectTask
  ) => {
    const parentTaskDepth = getTaskDepth(parentTaskId, projectTasks);

    if (parentTaskDepth !== null && parentTaskDepth >= 2) {
      return;
    }

    const addSubtaskToTask = (task: ProjectTask): ProjectTask => {
      if (task.id === parentTaskId) {
        const nextTask = {
          ...task,
          children: [...(task.children ?? []), subtask],
        };

        setSelectedTask((currentSelectedTask) =>
          currentSelectedTask?.id === parentTaskId
            ? nextTask
            : currentSelectedTask
        );

        return nextTask;
      }

      if (!task.children?.length) {
        return task;
      }

      return {
        ...task,
        children: task.children.map(addSubtaskToTask),
      };
    };

    setProjectTasks((currentTasks) => currentTasks.map(addSubtaskToTask));
  };

  const startEditingProjectName = () => {
    setDraftProjectName(projectName);
    setIsEditingProjectName(true);
  };

  const saveEditingProjectName = () => {
    const nextProjectName = draftProjectName.trim();

    if (nextProjectName) {
      setProjectName(nextProjectName);
    }

    setIsEditingProjectName(false);
  };

  const cancelEditingProjectName = () => {
    setDraftProjectName(projectName);
    setIsEditingProjectName(false);
  };

  return (
    <>
      <PageShell
        badge="Projects / 2"
        title={projectName}
        titleContent={
          <EditableName1
            draftName={draftProjectName}
            isEditing={isEditingProjectName}
            name={projectName}
            onCancelEditing={cancelEditingProjectName}
            onDraftNameChange={setDraftProjectName}
            onSaveEditing={saveEditingProjectName}
            onStartEditing={startEditingProjectName}
          />
        }
        description=""
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex shrink-0 flex-wrap justify-between items-center gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <Button
                className="rounded-full w-[78px] px-[8px] py-[3px] text-muted-foreground"
                style={{ borderColor: viewMode === "grid" ? "#fff" : undefined }}
                variant="outline"
                size="sm"
                onClick={() => setViewMode("grid")}
                type="button"
              >
                <LayoutGrid className="size-3" />
                Grid
              </Button>
              <Button
                className="rounded-full w-[78px] px-[8px] py-[3px] text-muted-foreground"
                style={{ borderColor: viewMode === "board" ? "#fff" : undefined }}
                variant="outline"
                size="sm"
                onClick={() => setViewMode("board")}
                type="button"
              >
                <KanbanSquare className="size-3" />
                Board
              </Button>
            </div>
            <SearchForm
              ariaLabel="Search tasks"
              className="h-[30px] flex-1"
              onSearch={onSearchTag}
              placeholder="Search task ..."
            />
            <div className="flex items-center gap-[8px]">
              {viewMode === "board" ? (
                <Select
                  value={grouping}
                  onValueChange={(value) =>
                    setGrouping(value as ProjectGrouping)
                  }
                >
                  <SelectTrigger
                    className="w-48 gap-[4px] text-muted-foreground border-0"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <SelectValue placeholder="Grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Grouping: Progress</SelectItem>
                    <SelectItem value="bucket">Grouping: Bucket</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Project settings"
                    className="py-[4px] rounded-full text-muted-foreground border-0 hover:text-foreground/80 data-[state=open]:text-foreground/80"
                    style={{ backgroundColor: "transparent" }}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    <Settings className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onSelect={() => setViewMode("grid")}>
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setViewMode("board")}>
                    Board View
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onNavigate("settings")}>
                    Project Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="h-[16px]"></div>
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {viewMode === "grid" ? (
              <ProjectGridView
                onOpenTaskDetails={openTaskDetails}
                tasks={projectTasks}
              />
            ) : (
              <ProjectBoardView
                onOpenTaskDetails={openTaskDetails}
                tasks={projectTasks}
              />
            )}
          </div>
        </div>
      </PageShell>
      <TaskDetailsModal
        canAddSubtask={canAddSubtaskToSelectedTask}
        canShowSubtasks={canShowSubtasksForSelectedTask}
        isOpen={Boolean(selectedTask)}
        onAddSubtask={addSubtaskToProject}
        onOpenChange={changeTaskDetailsOpen}
        parentTask={selectedTaskParent}
        task={selectedTask}
      />
    </>
  );
}
