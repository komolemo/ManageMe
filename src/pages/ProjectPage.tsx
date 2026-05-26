import { useState } from "react";
import { KanbanSquare, LayoutGrid, PanelLeftOpen, SlidersHorizontal } from "lucide-react";
import { EditableName } from "@/components/app/EditableName";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "@/pages/PageShell";
import { ProjectBoardView } from "@/pages/ProjectBoardView";
import { ProjectGridView } from "@/pages/ProjectGridView";
import { tasks } from "@/pages/projectData";
import type { PageKey } from "@/pages/pageTypes";

type ProjectViewMode = "grid" | "board";
type ProjectGrouping = "progress" | "bucket";

type ProjectPageProps = {
  onNavigate: (page: PageKey) => void;
};

export function ProjectPage({ onNavigate }: ProjectPageProps) {
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");
  const [grouping, setGrouping] = useState<ProjectGrouping>("progress");
  const [projectName, setProjectName] = useState("Project Page");
  const [draftProjectName, setDraftProjectName] = useState(projectName);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);

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
      <PanelLeftOpen className="size-4 text-foreground" />
      <PageShell
        badge="Projects / 2"
        title={projectName}
        titleContent={
          <EditableName
            draftName={draftProjectName}
            isEditing={isEditingProjectName}
            name={projectName}
            onCancelEditing={cancelEditingProjectName}
            onDraftNameChange={setDraftProjectName}
            onSaveEditing={saveEditingProjectName}
            onStartEditing={startEditingProjectName}
          />
        }
        description="View project tasks in Grid or Board mode, switch grouping, and open task settings."
      >
        <div className="mb-4 flex flex-wrap items-center gap-[4px] pb-[8px]">
          <Button
            className="rounded-full px-[8px]"
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            type="button"
          >
            <LayoutGrid className="size-4" />
            Grid
          </Button>
          <Button
            className="rounded-full px-[8px]"
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
            type="button"
          >
            <KanbanSquare className="size-4" />
            Board
          </Button>
          <Select
            value={grouping}
            onValueChange={(value) => setGrouping(value as ProjectGrouping)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Grouping: Progress</SelectItem>
              <SelectItem value="bucket">Grouping: Bucket</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("settings")}
            type="button"
          >
            <SlidersHorizontal className="size-4" />
            Task Settings
          </Button>
        </div>

        {viewMode === "grid" ? (
          <ProjectGridView tasks={tasks} />
        ) : (
          <ProjectBoardView tasks={tasks} />
        )}
      </PageShell>
    </>
  );
}
