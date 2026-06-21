import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TabPageHistoryControls() {
  return (
    <div className="flex h-[29px] shrink-0 items-center gap-[2px] px-[4px] py-[4px]">
      <Button
        aria-label="Back tab page"
        className="size-[24px] border-0 bg-transparent p-[2px] text-muted-foreground hover:bg-muted hover:text-foreground"
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <ArrowLeft className="size-4 text-current" />
      </Button>
      <Button
        aria-label="Forward tab page"
        className="size-[24px] border-0 bg-transparent p-[2px] text-muted-foreground hover:bg-muted hover:text-foreground"
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <ArrowRight className="size-4 text-current" />
      </Button>
    </div>
  );
}