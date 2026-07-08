import { PencilLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableNameProps = {
  name: string;
  resetKey?: string | number;
  autoResize?: boolean;
  className?: string;
  onSaveEditing: (name: string) => void;
  onCancelEditing?: () => void;
};

export function EditableName1({
  name,
  onSaveEditing,
  onCancelEditing,
  resetKey,
}: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    setDraftName(name);
    setIsEditing(false);
  }, [name, resetKey]);

  const startEditing = () => {
    setDraftName(name);
    setIsEditing(true);
  };

  const saveEditing = () => {
    const nextName = draftName.trim();

    if (nextName) {
      onSaveEditing(nextName);
    }

    setIsEditing(false);
  };

  const cancelEditing = () => {
    setDraftName(name);
    setIsEditing(false);
    onCancelEditing?.();
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-[8px] font-heading text-[20px] font-medium">
      {isEditing ? (
        <Input
          aria-label={`${name} title`}
          autoFocus
          className="h-[32px] min-w-0 px-[8px] text-[20px] font-medium rounded-md"
          onBlur={saveEditing}
          onChange={(event) => setDraftName(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === "Enter") {
              saveEditing();
            }

            if (event.key === "Escape") {
              cancelEditing();
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
            size-7 p-0 shrink-0 border-0
            bg-transparent text-transparent
            hover:bg-transparent hover:text-foreground
            focus-visible:text-foreground
          "
          onClick={(event) => {
            event.stopPropagation();
            startEditing();
          }}
          onKeyDown={(event) => event.stopPropagation()}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <PencilLine className="size-5 text-current" />
        </Button>
      </span>
    </div>
  );
}

export function EditableName2({
  name,
  autoResize = true,
  className,
  onSaveEditing,
  onCancelEditing,
  resetKey,
}: EditableNameProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const resizeTextArea = () => {
    const textArea = textAreaRef.current;

    if (!textArea) {
      return;
    }

    if (!autoResize) {
      textArea.style.height = "";
      return;
    }

    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
  };

  useEffect(() => {
    setDraftName(name);
    setIsEditing(false);
    setIsFocused(false);
  }, [name, resetKey]);

  const startEditing = () => {
    setDraftName(name);
    setIsEditing(true);
  };

  const saveEditing = () => {
    const nextName = draftName.trim();

    if (nextName) {
      onSaveEditing(nextName);
    }

    setIsEditing(false);
  };

  const cancelEditing = () => {
    setDraftName(name);
    setIsEditing(false);
    onCancelEditing?.();
  };

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    textAreaRef.current?.focus();
    resizeTextArea();
  }, [autoResize, isEditing]);

  useEffect(() => {
    if (isEditing) {
      resizeTextArea();
    }
  }, [autoResize, draftName, isEditing]);

  if (!isEditing) {
    return (
      <button
        aria-label={`${name} title`}
        className={cn(
          "block min-h-[32px] min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-[8px] py-[2px] text-left font-heading text-[20px] font-medium leading-[26px] whitespace-normal shadow-none focus:border-ring focus:ring-1 focus:ring-ring/50 focus:outline-none",
          className
        )}
        onClick={(event) => {
          event.stopPropagation();
          startEditing();
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
      className={cn(
        "block box-border min-h-[32px] min-w-0 flex-1 resize-none rounded-md border border-transparent bg-transparent px-[8px] py-[2px] font-heading text-[20px] font-medium leading-[26px] shadow-none outline-none focus:border-ring focus:ring-1 focus:ring-ring/50",
        className
      )}
      style={{
        backgroundColor: isFocused ? undefined : "transparent",
        overflow: "hidden",
        overflowWrap: "anywhere",
        wordBreak: "normal",
      }}
      onBlur={() => {
        setIsFocused(false);
        saveEditing();
      }}
      onChange={(event) => {
        setDraftName(event.target.value);
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
          saveEditing();
        }

        if (event.key === "Escape") {
          cancelEditing();
        }
      }}
      ref={textAreaRef}
      rows={1}
      value={draftName}
      wrap="soft"
    />
  );
}
