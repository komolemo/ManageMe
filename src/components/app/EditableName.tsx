import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EditableNameProps = {
  name: string;
  isEditing: boolean;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onStartEditing: () => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
};

export function EditableName({
  name,
  isEditing,
  draftName,
  onDraftNameChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
}: EditableNameProps) {
  return (
    <CardTitle className="flex min-w-0 flex-1 items-center gap-[8px] text-[20px]">
      {isEditing ? (
        <Input
          aria-label={`${name} title`}
          autoFocus
          className="h-[32px] min-w-0 px-[8px] text-[20px] font-medium rounded-md"
          onBlur={onSaveEditing}
          onChange={(event) => onDraftNameChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === "Enter") {
              onSaveEditing();
            }

            if (event.key === "Escape") {
              onCancelEditing();
            }
          }}
          value={draftName}
        />
      ) : (
        <span className="min-w-0 truncate">{name}</span>
      )}
      <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
        <Button
          aria-label={`Edit ${name} title`}
          className="
            size-[28px] p-0 shrink-0 border-0
            bg-transparent text-transparent
            hover:bg-transparent hover:text-foreground
            focus-visible:text-foreground
          "
          onClick={(event) => {
            event.stopPropagation();
            onStartEditing();
          }}
          onKeyDown={(event) => event.stopPropagation()}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <PencilLine className="size-[20px] text-current" />
        </Button>
      </span>
    </CardTitle>
  );
}
