import type { Dispatch, SetStateAction } from "react";
import { KanbanSquare, Kanban, LayoutGrid, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchForm } from "@/components/app/SearchForm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectGrouping, ProjectViewMode } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

type ProjectPageHeaderProps = {
  grouping: ProjectGrouping;
  onOpenSettings: () => void;
  onSearchTag: (tag: string) => void;
  setGrouping: Dispatch<SetStateAction<ProjectGrouping>>;
  setViewMode: Dispatch<SetStateAction<ProjectViewMode>>;
  viewMode: ProjectViewMode;
};

export function ProjectPageHeader({
  grouping,
  onOpenSettings,
  onSearchTag,
  setGrouping,
  setViewMode,
  viewMode,
}: ProjectPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex shrink-0 flex-wrap justify-between items-center gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Button
          className={cn(
            "rounded-full px-[8px] py-[3px] text-muted-foreground bg-transparent border-2",
            viewMode === "grid" ? 
              "text-foreground border-highlight-1 dark:border-highlight-1" :
              "text-muted-foreground ",
          )}
          variant="outline"
          size="sm"
          onClick={() => setViewMode("grid")}
          type="button"
        >
          <div
            className={
              cn("border-1 rounded-xs", 
                viewMode === "grid" ? 
                  "bg-highlight-1 border-transparent" : 
                  "bg-transparent border-muted-foreground"
              )}
          >
            <LayoutGrid
              className={
                cn("size-4",
                  viewMode === "grid" ? 
                    "text-background" : 
                    "text-muted-foreground"
                )}
            />
          </div>
          {t("project.grid")}
        </Button>
        <Button
          className={cn(
            "rounded-full px-[8px] py-[3px] text-muted-foreground border-2",
            viewMode === "board" ? 
              "text-foreground border-highlight-1 dark:border-highlight-1" :
              "text-muted-foreground ",
          )}
          variant="outline"
          size="sm"
          onClick={() => setViewMode("board")}
          type="button"
        >
          <div
            className={
              cn("border-1 rounded-xs", 
                viewMode === "board" ? 
                  "bg-highlight-1 border-transparent" : 
                  "bg-transparent border-muted-foreground"
              )}
          >
            <Kanban
              className={
                cn("size-4",
                  viewMode === "board" ? 
                    "text-background" : 
                    "text-muted-foreground"
                )}
            />
          </div>
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
            onValueChange={(value) => setGrouping(value as ProjectGrouping)}
          >
            <SelectTrigger
              className="w-48 gap-[4px] text-muted-foreground border-0"
              style={{ backgroundColor: "transparent" }}
            >
              <SelectValue placeholder={t("project.grouping")} />
            </SelectTrigger>
            <SelectContent className="duration-0 data-open:animate-none data-closed:animate-none">
              <SelectItem value="progress">{t("project.groupingProgress")}</SelectItem>
              <SelectItem value="bucket">{t("project.groupingBucket")}</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
        <Button
          aria-label={t("project.settings")}
          className="py-[4px] rounded-full text-muted-foreground border-0 hover:text-foreground/80"
          onClick={onOpenSettings}
          style={{ backgroundColor: "transparent" }}
          variant="outline"
          size="sm"
          type="button"
        >
          <Settings className="size-g" />
        </Button>
      </div>
    </div>
  );
}
