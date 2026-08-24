import { CommandBar } from "@/pages/DocumentPage/CommandBar";
import type { CommandBarProps } from "@/pages/DocumentPage/CommandBar";

export function CommandBarDock(props: CommandBarProps) {
  return (
    <div className="sticky top-0 z-20 h-[36px]">
      <CommandBar {...props} />
    </div>
  );
}
