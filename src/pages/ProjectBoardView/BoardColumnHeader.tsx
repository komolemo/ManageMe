import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BoardColumnHeaderProps = {
  onOpenCreateTaskCard: () => void;
  status: string;
};

export function BoardColumnHeader({
  onOpenCreateTaskCard,
  status,
}: BoardColumnHeaderProps) {
  return (
    <header className="shrink-0 mr-[18px]">
      <div className="px-[12px] py-[8px] mb-[8px] bg-muted flex items-center justify-between">
        <h2 className="my-[4px] text-sm font-semibold">{status}</h2>
      </div>
      <Button
        aria-label={`Add task to ${status}`}
        className="py-[8px] mx-[0px] w-full transition-opacity bg-muted border-0"
        onClick={onOpenCreateTaskCard}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <CirclePlus className="text-muted-foreground size-6" />
      </Button>
    </header>
  );
}
