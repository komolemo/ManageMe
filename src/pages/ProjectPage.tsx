import { useState } from "react";
import { KanbanSquare, LayoutGrid, PanelLeftOpen, Settings } from "lucide-react";
import { EditableName } from "@/components/app/EditableName";
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
        description=""
      >
        <div className="mb-4 flex flex-wrap justify-between items-center gap-[4px] pb-[8px]">
          <div className="flex items-center gap-[8px]">
            <Button
              className="rounded-full px-[8px] py-[2px] text-muted-foreground"
              style={{ borderColor: viewMode === "grid" ? "#fff" : undefined }}
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              type="button"
            >
              <LayoutGrid className="size-4" />
              Grid
            </Button>
            <Button
              className="rounded-full px-[8px] py-[2px] text-muted-foreground"
              style={{ borderColor: viewMode === "board" ? "#fff" : undefined }}
              variant="outline"
              size="sm"
              onClick={() => setViewMode("board")}
              type="button"
            >
              <KanbanSquare className="size-4" />
              Board
            </Button>
          </div>
          <div className="flex items-center gap-[8px]">
            <Select
              value={grouping}
              onValueChange={(value) => setGrouping(value as ProjectGrouping)}
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

        {viewMode === "grid" ? (
          <ProjectGridView tasks={tasks} />
        ) : (
          <ProjectBoardView tasks={tasks} />
        )}
      </PageShell>
    </>
  );
}
