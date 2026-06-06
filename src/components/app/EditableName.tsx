import { PencilLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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

export function EditableName1({
  name,
  isEditing,
  draftName,
  onDraftNameChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
}: EditableNameProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[8px] font-heading text-[20px] font-medium">
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
    </div>
  );
}

export function EditableName2({
  name,
  isEditing,
  draftName,
  onDraftNameChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
}: EditableNameProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const resizeTextArea = () => {
    const textArea = textAreaRef.current;

    if (!textArea) {
      return;
    }

    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
  };

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    textAreaRef.current?.focus();
    resizeTextArea();
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      resizeTextArea();
    }
  }, [draftName, isEditing]);

  if (!isEditing) {
    return (
      <button
        aria-label={`${name} title`}
        className="
          min-h-[32px] min-w-0 flex-1 rounded-md border border-transparent
          bg-transparent px-[8px] py-[2px] text-left font-heading text-[20px]
          font-medium whitespace-normal shadow-none
          focus:border-ring focus:ring-1 focus:ring-ring/50 focus:outline-none
        "
        onClick={(event) => {
          event.stopPropagation();
          onStartEditing();
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
        type="button"
      >
        {name}
      </button>
    );
  }

  return (
    <textarea
      aria-label={`${name} title`}
      className="
        min-h-[32px] min-w-0 flex-1 resize-none rounded-md border border-transparent
        bg-transparent
        px-[8px] pb-[0px] font-heading text-[20px] font-medium shadow-none
        outline-none focus:border-ring focus:ring-1 focus:ring-ring/50
      "
      style={{
        backgroundColor: isFocused ? undefined : "transparent",
        overflow: "hidden",
        overflowWrap: "anywhere",
        wordBreak: "normal",
      }}
      onBlur={() => {
        setIsFocused(false);
        onSaveEditing();
      }}
      onChange={(event) => {
        onDraftNameChange(event.target.value);
        resizeTextArea();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onFocus={() => {
        setIsFocused(true);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();

        if (event.key === "Enter") {
          event.preventDefault();
          onSaveEditing();
        }

        if (event.key === "Escape") {
          onCancelEditing();
        }
      }}
      ref={textAreaRef}
      rows={1}
      value={draftName}
      wrap="soft"
    />
  );
}
