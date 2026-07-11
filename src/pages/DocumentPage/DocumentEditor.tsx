import { useDocument } from "@/hooks/useDocument";
import type { EditorCommand } from "@/pages/DocumentPage/editorCommands";
import { MarkDownEditor } from "@/pages/DocumentPage/MarkDownEditor";
import { TextEditor } from "@/pages/DocumentPage/TextEditor";

type DocumentEditorProps = {
  command: EditorCommand | null;
  documentId: string;
  isMarkdownMode: boolean;
  initialContent: string;
  onCommandHandled: () => void;
};

function preserveConsecutiveBlankLines(markdown: string) {
  const lines = markdown.split("\n");
  const preservedLines: string[] = [];
  let fenceMarker: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trimStart();
    const fenceMatch = trimmedLine.match(/^(```+|~~~+)/);

    if (fenceMatch) {
      if (fenceMarker && trimmedLine.startsWith(fenceMarker)) {
        fenceMarker = null;
      } else if (!fenceMarker) {
        fenceMarker = fenceMatch[1];
      }

      preservedLines.push(line);
      continue;
    }

    if (fenceMarker || line.trim() !== "") {
      preservedLines.push(line);
      continue;
    }

    let blankLineCount = 0;

    while (
      index + blankLineCount < lines.length &&
      lines[index + blankLineCount].trim() === ""
    ) {
      blankLineCount += 1;
    }

    preservedLines.push("");

    for (let blankIndex = 1; blankIndex < blankLineCount; blankIndex += 1) {
      preservedLines.push("&nbsp;", "");
    }

    index += blankLineCount - 1;
  }

  return preservedLines.join("\n");
}

export function DocumentEditor({
  command,
  documentId,
  isMarkdownMode,
  initialContent,
  onCommandHandled,
}: DocumentEditorProps) {
  const { content, saveDocument, setContent } = useDocument({
    documentId,
    initialContent,
  });

  return (
    <div className="grid gap-3">
      {isMarkdownMode ? (
        <MarkDownEditor
          content={content}
          command={command}
          isActive={isMarkdownMode}
          onChangeContent={setContent}
          onCommandHandled={onCommandHandled}
          onSave={saveDocument}
        />
      ) : (
        <TextEditor
          command={command}
          content={content}
          onChangeContent={setContent}
          onCommandHandled={onCommandHandled}
          onSave={saveDocument}
        />
      )}
    </div>
  );
}
