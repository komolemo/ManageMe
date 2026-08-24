import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Kanban, LayoutGrid, Settings } from "lucide-react";
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
  const [borderViewMode, setBorderViewMode] = useState(viewMode);
  const [iconViewMode, setIconViewMode] = useState(viewMode);
  const pendingAnimationFrame = useRef<number | null>(null);

  const cancelPendingViewChange = () => {
    if (pendingAnimationFrame.current !== null) {
      window.cancelAnimationFrame(pendingAnimationFrame.current);
      pendingAnimationFrame.current = null;
    }
  };

  const changeViewMode = (nextViewMode: ProjectViewMode) => {
    cancelPendingViewChange();

    // Step 1: update the selected button border before changing expensive view content.
    setBorderViewMode(nextViewMode);
    pendingAnimationFrame.current = window.requestAnimationFrame(() => {
      // Step 2: update the selected button icon on the following paint frame.
      setIconViewMode(nextViewMode);
      pendingAnimationFrame.current = window.requestAnimationFrame(() => {
        // Step 3: switch and persist the actual Project page view last.
        setViewMode(nextViewMode);
        pendingAnimationFrame.current = null;
      });
    });
  };

  useEffect(() => {
    setBorderViewMode(viewMode);
    setIconViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => cancelPendingViewChange, []);

  return (
    <div className="mb-4 flex shrink-0 flex-wrap justify-between items-center gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Button
          className={cn(
            "rounded-full px-[8px] py-[3px] text-muted-foreground bg-transparent border-2",
            borderViewMode === "grid" ? 
              "text-foreground border-highlight-1 dark:border-highlight-1" :
              "text-muted-foreground ",
          )}
          variant="outline"
          size="sm"
          onClick={() => changeViewMode("grid")}
          type="button"
        >
          <div
            className={
              cn("border-1 rounded-xs", 
                iconViewMode === "grid" ? 
                  "bg-highlight-1 border-transparent" : 
                  "bg-transparent border-muted-foreground"
              )}
          >
            <LayoutGrid
              className={
                cn("size-4",
                  iconViewMode === "grid" ? 
                    "text-background" : 
                    "text-muted-foreground"
                )}
            />
          </div>
          <span className="sm:hidden md:inline-flex">{t("project.grid")}</span>
        </Button>
        <Button
          className={cn(
            "rounded-full px-[8px] py-[3px] text-muted-foreground border-2",
            borderViewMode === "board" ? 
              "text-foreground border-highlight-1 dark:border-highlight-1" :
              "text-muted-foreground ",
          )}
          variant="outline"
          size="sm"
          onClick={() => changeViewMode("board")}
          type="button"
        >
          <div
            className={
              cn("border-1 rounded-xs", 
                iconViewMode === "board" ? 
                  "bg-highlight-1 border-transparent" : 
                  "bg-transparent border-muted-foreground"
              )}
          >
            <Kanban
              className={
                cn("size-4",
                  iconViewMode === "board" ? 
                    "text-background" : 
                    "text-muted-foreground"
                )}
            />
          </div>
          <span className="sm:hidden md:inline-flex">{t("project.board")}</span>
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
              className="w-40 gap-[4px] text-muted-foreground border-0"
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
          className="py-1 px-2 rounded-full text-muted-foreground border-0 hover:text-foreground/80"
          onClick={onOpenSettings}
          style={{ backgroundColor: "transparent" }}
          variant="outline"
          size="sm"
          type="button"
        >
          <Settings className="size-6" />
        </Button>
      </div>
    </div>
  );
}
