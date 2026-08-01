import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { MouseEvent } from "react";
import { ChevronDown, ChevronRight, KanbanSquare, LayoutGrid, ListTodo, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchForm } from "@/components/app/SearchForm";
import { ProjectWorkspaceList } from "@/components/app/ProjectWorkspaceList";
import { DetailSidebarHeader } from "@/layout/DetailSidebar/DetailSidebarHeader";
import { TaskDetailsModal } from "@/pages/ProjectPage/TaskDetailsModal";
import { PageShell } from "@/pages/PageShell";
import { ProjectBoardView } from "@/pages/ProjectBoardView/ProjectBoardView";
import { ProjectGridView } from "@/pages/ProjectGridView/ProjectGridView";
import {
  type ProjectBucket,
  type ProjectMilestone,
  type ProjectTask,
} from "@/pages/projectData";
import type { PageKey } from "@/pages/pageTypes";
import type { Workspace } from "@/features/workspace/types";
import { useTranslation } from "react-i18next";

type ProjectViewMode = "grid" | "board";
type ProjectGrouping = "progress" | "bucket";

type ProjectPageProps = {
  buckets: ProjectBucket[];
  milestones: ProjectMilestone[];
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onOpenProject: (workspace: Workspace) => void;
  onOpenProjectInNewTab: (workspace: Workspace) => void;
  onOpenTaskInNewTab: (task: ProjectTask, activateTab?: boolean) => void;
  onSearchTag: (tag: string) => void;
  projectTasks: ProjectTask[];
  setProjectTasks: Dispatch<SetStateAction<ProjectTask[]>>;
  workspaceId?: string;
};

function flattenProjectTasks(tasks: ProjectTask[]): ProjectTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenProjectTasks(task.children ?? []),
  ]);
}

function findTaskById(
  taskId: ProjectTask["id"],
  currentTasks: ProjectTask[]
): ProjectTask | null {
  for (const task of currentTasks) {
    if (task.id === taskId) {
      return task;
    }

    if (task.children?.length) {
      const foundTask = findTaskById(taskId, task.children);

      if (foundTask) {
        return foundTask;
      }
    }
  }

  return null;
}

function taskContainsTask(task: ProjectTask, taskId: ProjectTask["id"]): boolean {
  return Boolean(findTaskById(taskId, task.children ?? []));
}

function removeTaskById(
  currentTasks: ProjectTask[],
  taskId: ProjectTask["id"]
): { nextTasks: ProjectTask[]; removedTask: ProjectTask | null } {
  let removedTask: ProjectTask | null = null;
  const nextTasks = currentTasks.flatMap((task) => {
    if (task.id === taskId) {
      removedTask = task;
      return [];
    }

    if (!task.children?.length) {
      return [task];
    }

    const childResult = removeTaskById(task.children, taskId);

    if (childResult.removedTask) {
      removedTask = childResult.removedTask;
    }

    return [
      {
        ...task,
        children: childResult.nextTasks,
      },
    ];
  });

  return { nextTasks, removedTask };
}

function addChildTask(
  currentTasks: ProjectTask[],
  parentTaskId: ProjectTask["id"],
  childTask: ProjectTask
): ProjectTask[] {
  return currentTasks.map((task) => {
    if (task.id === parentTaskId) {
      const currentChildren = task.children ?? [];

      if (currentChildren.some((child) => child.id === childTask.id)) {
        return task;
      }

      return {
        ...task,
        children: [...currentChildren, childTask],
      };
    }

    if (!task.children?.length) {
      return task;
    }

    return {
      ...task,
      children: addChildTask(task.children, parentTaskId, childTask),
    };
  });
}

export function ProjectPage({
  buckets,
  milestones,
  onNavigate,
  onOpenInNewTab,
  onOpenProject,
  onOpenProjectInNewTab,
  onOpenTaskInNewTab,
  onSearchTag,
  projectTasks,
  setProjectTasks,
  workspaceId,
}: ProjectPageProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");
  const [grouping, setGrouping] = useState<ProjectGrouping>("progress");
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const flatProjectTasks = useMemo(
    () => flattenProjectTasks(projectTasks),
    [projectTasks]
  );

  const openTaskDetails = (task: ProjectTask) => {
    setSelectedTask(task);
  };

  const changeTaskDetailsOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTask(null);
    }
  };

  const getTaskDepth = (
    taskId: ProjectTask["id"],
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
    taskId: ProjectTask["id"],
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
    parentTaskId: ProjectTask["id"],
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

  const registerExistingSubtask = (
    parentTaskId: ProjectTask["id"],
    subtask: ProjectTask
  ) => {
    setProjectTasks((currentTasks) => {
      const parentTask = findTaskById(parentTaskId, currentTasks);

      if (
        !parentTask ||
        parentTask.id === subtask.id ||
        taskContainsTask(subtask, parentTask.id)
      ) {
        return currentTasks;
      }

      const { nextTasks, removedTask } = removeTaskById(
        currentTasks,
        subtask.id
      );
      const taskToRegister = removedTask ?? subtask;
      const nextProjectTasks = addChildTask(
        nextTasks,
        parentTaskId,
        taskToRegister
      );

      setSelectedTask((currentSelectedTask) =>
        currentSelectedTask?.id === parentTaskId
          ? findTaskById(parentTaskId, nextProjectTasks)
          : currentSelectedTask
      );

      return nextProjectTasks;
    });
  };

  const registerExistingParentTask = (
    taskId: ProjectTask["id"],
    parentTask: ProjectTask
  ) => {
    setProjectTasks((currentTasks) => {
      const currentTask = findTaskById(taskId, currentTasks);

      if (
        !currentTask ||
        currentTask.id === parentTask.id ||
        taskContainsTask(currentTask, parentTask.id)
      ) {
        return currentTasks;
      }

      const { nextTasks, removedTask } = removeTaskById(currentTasks, taskId);

      if (!removedTask) {
        return currentTasks;
      }

      setSelectedTask(removedTask);

      return addChildTask(nextTasks, parentTask.id, removedTask);
    });
  };

  const openProjectsWithMouseWheel = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("projects");
  };

  return (
    <>
      <PageShell
        breadcrumbs={[
          {
            label: t("pages.projects"),
            onClick: () => onNavigate("projects"),
            onAuxClick: openProjectsWithMouseWheel,
          },
          { label: "2" },
        ]}
        detailSidebar={
          <ProjectWorkspaceList
            activeWorkspaceId={workspaceId}
            filter=""
            onOpenProject={onOpenProject}
            onOpenProjectInNewTab={onOpenProjectInNewTab}
          />
        }
        detailSidebarHeader={
          <DetailSidebarHeader name={t("sidebar.projectList")} />
        }
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
                <LayoutGrid className="size-5" />
                {t("project.grid")}
              </Button>
              <Button
                className="rounded-full w-[78px] px-[8px] py-[3px] text-muted-foreground"
                style={{ borderColor: viewMode === "board" ? "#fff" : undefined }}
                variant="outline"
                size="sm"
                onClick={() => setViewMode("board")}
                type="button"
              >
                <KanbanSquare className="size-5" />
                {t("project.board")}
              </Button>
            </div>
            <SearchForm
              ariaLabel={t("project.searchTasks")}
              className="h-[30px] flex-1"
              onSearch={onSearchTag}
              placeholder={t("project.searchPlaceholder")}
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
                    <SelectValue placeholder={t("project.grouping")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">{t("project.groupingProgress")}</SelectItem>
                    <SelectItem value="bucket">{t("project.groupingBucket")}</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              <Button
                aria-label={t("project.settings")}
                className="py-[4px] rounded-full text-muted-foreground border-0 hover:text-foreground/80"
                onClick={() => onNavigate("projectSettings")}
                style={{ backgroundColor: "transparent" }}
                variant="outline"
                size="sm"
                type="button"
              >
                <Settings className="size-g" />
              </Button>
            </div>
          </div>
          <div className="h-[16px]"></div>
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {viewMode === "grid" ? (
              <ProjectGridView
                onOpenTaskInNewTab={(task) =>
                  onOpenTaskInNewTab(task, false)
                }
                onOpenTaskDetails={openTaskDetails}
                tasks={projectTasks}
              />
            ) : (
              <ProjectBoardView
                buckets={buckets}
                grouping={grouping}
                onOpenTaskInNewTab={(task) =>
                  onOpenTaskInNewTab(task, false)
                }
                onOpenTaskDetails={openTaskDetails}
                tasks={projectTasks}
              />
            )}
          </div>
        </div>
      </PageShell>
      <TaskDetailsModal
        buckets={buckets}
        canAddSubtask={canAddSubtaskToSelectedTask}
        canShowSubtasks={canShowSubtasksForSelectedTask}
        isOpen={Boolean(selectedTask)}
        milestones={milestones}
        onAddSubtask={addSubtaskToProject}
        onOpenChange={changeTaskDetailsOpen}
        onOpenInNewTab={onOpenTaskInNewTab}
        onRegisterExistingParentTask={registerExistingParentTask}
        onRegisterExistingSubtask={registerExistingSubtask}
        parentTask={selectedTaskParent}
        projectTasks={flatProjectTasks}
        task={selectedTask}
      />
    </>
  );
}

export function ProjectTaskTree({
  onOpenTask,
  onOpenTaskInNewTab,
  tasks,
}: {
  onOpenTask: (task: ProjectTask) => void;
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  tasks: ProjectTask[];
}) {
  return (
    <div className="grid gap-[4px]">
      {tasks.map((task) => (
        <ProjectTaskTreeItem
          key={task.id}
          level={0}
          onOpenTask={onOpenTask}
          onOpenTaskInNewTab={onOpenTaskInNewTab}
          task={task}
        />
      ))}
    </div>
  );
}

function ProjectTaskTreeItem({
  level,
  onOpenTask,
  onOpenTaskInNewTab,
  task,
}: {
  level: number;
  onOpenTask: (task: ProjectTask) => void;
  onOpenTaskInNewTab: (task: ProjectTask) => void;
  task: ProjectTask;
}) {
  const { t } = useTranslation();
  const hasChildren = Boolean(task.children?.length);
  const [isOpen, setIsOpen] = useState(true);
  const ToggleIcon = isOpen ? ChevronDown : ChevronRight;

  return (
    <div className="grid gap-[4px]">
      <div className="flex min-w-0 items-center rounded-lg py-[4px] pr-[4px] hover:bg-accent-2">
        <div className="flex min-w-0 flex-1 items-center" style={{ marginLeft: `${level * 24}px` }}>
          {hasChildren ? (
            <button
              aria-label={isOpen
                ? t("project.collapseTask", { taskName: task.subject })
                : t("project.expandTask", { taskName: task.subject })}
              className="grid size-[24px] shrink-0 place-items-center border-0 bg-transparent p-0"
              onClick={() => setIsOpen((open) => !open)}
              type="button"
            >
              <ToggleIcon className="size-5 text-muted-foreground" />
            </button>
          ) : (
            <span className="size-[24px] shrink-0" />
          )}
          <button
            className="flex min-w-0 flex-1 items-center gap-[6px] border-0 bg-transparent p-0 text-left text-[14px]"
            onAuxClick={(event) => event.button === 1 && event.preventDefault()}
            onClick={() => onOpenTask(task)}
            onMouseDown={(event) => {
              if (event.button === 1) {
                event.preventDefault();
                onOpenTaskInNewTab(task);
              }
            }}
            type="button"
          >
            <ListTodo className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{task.subject}</span>
          </button>
        </div>
      </div>
      {hasChildren && isOpen
        ? task.children?.map((child) => (
            <ProjectTaskTreeItem
              key={child.id}
              level={level + 1}
              onOpenTask={onOpenTask}
              onOpenTaskInNewTab={onOpenTaskInNewTab}
              task={child}
            />
          ))
        : null}
    </div>
  );
}

export function filterProjectTasks(tasks: ProjectTask[], query: string): ProjectTask[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tasks;

  return tasks.flatMap((task) => {
    const children = filterProjectTasks(task.children ?? [], query);
    if (
      task.subject.toLowerCase().includes(normalizedQuery) ||
      String(task.id).includes(normalizedQuery) ||
      children.length
    ) {
      return [{ ...task, children }];
    }
    return [];
  });
}
