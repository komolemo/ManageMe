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
import { useTranslation } from "react-i18next";

const commandButtonClassName = "size-[32px] shrink-0 p-[8px] rounded-md bg-transparent text-muted-foreground hover:bg-sidebar-foreground/10";

export type CommandBarProps = {
  onCommand: (command: Omit<EditorCommand, "id">) => void;
};

export function CommandBar({
  onCommand,
}: CommandBarProps) {
  const { t } = useTranslation();

  return (
    <div
      aria-label={t("editor.commandBar")}
      className="flex h-[36px] items-center gap-[4px] justify-between overflow-hidden rounded-md border bg-background px-[6px] py-[2px]"
    >
      <div className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t("editor.selectHeading")}
              className={commandButtonClassName}
              title={t("editor.heading")}
              type="button"
              variant="default"
            >
              <Heading className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[44px]">
            <DropdownMenuItem
              aria-label={t("editor.heading1")}
              onSelect={() => onCommand({ level: 1, type: "heading" })}
            >
              <Heading1 className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-label={t("editor.heading2")}
              onSelect={() => onCommand({ level: 2, type: "heading" })}
            >
              <Heading2 className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-label={t("editor.heading3")}
              onSelect={() => onCommand({ level: 3, type: "heading" })}
            >
              <Heading3 className="size-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button aria-label={t("editor.bold")} className={commandButtonClassName} title={t("editor.bold")} type="button" variant="default">
          <Bold className="size-4" />
        </Button>
        <Button aria-label={t("editor.italic")} className={commandButtonClassName} title={t("editor.italic")} type="button" variant="default">
          <Italic className="size-4" />
        </Button>
        <Button aria-label={t("editor.blockQuote")} className={commandButtonClassName} title={t("editor.blockQuote")} type="button" variant="default">
          <Quote className="size-4" />
        </Button>
        <Button aria-label={t("editor.codeBlock")} className={commandButtonClassName} title={t("editor.codeBlock")} type="button" variant="default">
          <Code2 className="size-4" />
        </Button>
        <Button aria-label={t("editor.url")} className={commandButtonClassName} title={t("editor.url")} type="button" variant="default">
          <Link className="size-4" />
        </Button>
        <Separator orientation="vertical" className="my-[6px]" />
        <Button aria-label={t("editor.bulletedList")} className={commandButtonClassName} title={t("editor.bulletedList")} type="button" variant="default">
          <List className="size-4" />
        </Button>
        <Button aria-label={t("editor.numberedList")} className={commandButtonClassName} title={t("editor.numberedList")} type="button" variant="default">
          <ListOrdered className="size-4" />
        </Button>
        <Button aria-label={t("editor.checkbox")} className={commandButtonClassName} title={t("editor.checkbox")} type="button" variant="default">
          <ListTodo className="size-4" />
        </Button>
      </div>
    </div>
  );
}
