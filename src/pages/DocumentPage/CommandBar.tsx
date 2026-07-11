import {
  Bold,
  Code2,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { EditorCommand } from "@/pages/DocumentPage/editorCommands";

const commandButtonClassName = "size-[32px] shrink-0 p-[8px] rounded-md bg-transparent text-muted-foreground hover:bg-sidebar-foreground/10";

export type CommandBarProps = {
  isMarkdownMode: boolean;
  onCommand: (command: Omit<EditorCommand, "id">) => void;
  onMarkdownModeChange: (isMarkdownMode: boolean) => void;
};

export function CommandBar({
  isMarkdownMode,
  onCommand,
  onMarkdownModeChange,
}: CommandBarProps) {

  return (
    <div
      aria-label="Markdown command bar"
      className="flex h-[36px] items-center gap-[4px] justify-between overflow-hidden rounded-md border bg-background px-[6px] py-[2px]"
    >
      <div
        aria-label="Editor mode"
        className="grid h-[28px] shrink-0 grid-cols-2 overflow-hidden rounded-md p-[2px]"
        role="tablist"
      >
        <button
          aria-selected={!isMarkdownMode}
          className={`min-w-[64px] rounded-sm border-0 px-[8px] text-xs transition-colors ${
            !isMarkdownMode
              ? "bg-sidebar-foreground/10 text-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onMarkdownModeChange(false)}
          role="tab"
          type="button"
        >
          Text
        </button>
        <button
          aria-selected={isMarkdownMode}
          className={`min-w-[82px] rounded-sm border-0 px-[8px] text-xs transition-colors ${
            isMarkdownMode
              ? "bg-sidebar-foreground/10 text-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onMarkdownModeChange(true)}
          role="tab"
          type="button"
        >
          Markdown
        </button>
      </div>

      <div className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Select heading level"
              className={commandButtonClassName}
              title="Heading"
              type="button"
              variant="default"
            >
              <Heading className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[44px]">
            <DropdownMenuItem
              aria-label="Heading 1"
              onSelect={() => onCommand({ level: 1, type: "heading" })}
            >
              <Heading1 className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-label="Heading 2"
              onSelect={() => onCommand({ level: 2, type: "heading" })}
            >
              <Heading2 className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-label="Heading 3"
              onSelect={() => onCommand({ level: 3, type: "heading" })}
            >
              <Heading3 className="size-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button aria-label="Bold" className={commandButtonClassName} title="Bold" type="button" variant="default">
          <Bold className="size-4" />
        </Button>
        <Button aria-label="Italic" className={commandButtonClassName} title="Italic" type="button" variant="default">
          <Italic className="size-4" />
        </Button>
        <Button aria-label="Block quote" className={commandButtonClassName} title="Block quote" type="button" variant="default">
          <Quote className="size-4" />
        </Button>
        <Button aria-label="Code block" className={commandButtonClassName} title="Code block" type="button" variant="default">
          <Code2 className="size-4" />
        </Button>
        <Button aria-label="URL" className={commandButtonClassName} title="URL" type="button" variant="default">
          <Link className="size-4" />
        </Button>
        <Separator orientation="vertical" className="my-[6px]" />
        <Button aria-label="Bulleted list" className={commandButtonClassName} title="Bulleted list" type="button" variant="default">
          <List className="size-4" />
        </Button>
        <Button aria-label="Numbered list" className={commandButtonClassName} title="Numbered list" type="button" variant="default">
          <ListOrdered className="size-4" />
        </Button>
        <Button aria-label="Checkbox" className={commandButtonClassName} title="Checkbox" type="button" variant="default">
          <ListTodo className="size-4" />
        </Button>
      </div>
    </div>
  );
}
