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
    <div className="grid gap-[12px]">
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
