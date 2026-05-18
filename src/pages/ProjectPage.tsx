import { useState } from "react";
import { KanbanSquare, LayoutGrid, SlidersHorizontal, PanelLeftOpen } from "lucide-react";
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

type ProjectViewMode = "grid" | "board";

export function ProjectPage() {
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");

  return (
    <>
      <PanelLeftOpen className="size-4 text-foreground" />
      <PageShell
        badge="Projects / 2"
        title="Project Page"
        description="Grid / Board表示、Progress / Bucketグルーピング、Task Settingsの配置。"
      >
        <div className="mb-4 flex flex-wrap items-center gap-[4px] pb-[8px]">
          <Button
            className="rounded-full px-[8px]"
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
            Grid
          </Button>
          <Button
            className="rounded-full px-[8px]"
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
          >
            <KanbanSquare className="size-4" />
            Board
          </Button>
          <Select defaultValue="progress">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Grouping: Progress</SelectItem>
              <SelectItem value="bucket">Grouping: Bucket</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
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
