import { CirclePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type BoardColumnHeaderProps = {
  onOpenCreateTaskCard: () => void;
  status: string;
};

export function BoardColumnHeader({
  onOpenCreateTaskCard,
  status,
}: BoardColumnHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="shrink-0 mr-[18px]">
      <div className="px-2 pb-1 mb-[8px] border-b-4 bg- flex items-center justify-between">
        <h2 className="my-[4px] text-sm font-semibold">{status}</h2>
        <Button
          aria-label={t("project.addTaskTo", { taskStatus: status })}
          className="bg-transparent dark:hover:bg-accent-2 rounded-full"
          onClick={onOpenCreateTaskCard}
          size="icon-xs"
          type="button"
          variant="default"
        >
          <Plus className="text-muted-foreground size-6" />
        </Button>
      </div>
      <Button
        aria-label={t("project.addTaskTo", { taskStatus: status })}
        className="h-9 py-1 mx-[0px] w-full border-muted shadow-[0_5px_10px_-3px_var(--shadow),0_4px_6px_-4px_var(--shadow)] dark:border-transparent dark:shadow-none md:hidden lg:inline-flex"
        onClick={onOpenCreateTaskCard}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <CirclePlus className="text-muted-foreground size-5" />
      </Button>
    </header>
  );
}
