import { type KeyboardEvent, useLayoutEffect, useRef } from "react";
import {
  applyEditorCommandToSelection,
  type EditorCommand,
} from "@/pages/DocumentPage/editorCommands";
import { useTranslation } from "react-i18next";

type MarkDownEditorProps = {
  command: EditorCommand | null;
  content: string;
  isActive: boolean;
  onChangeContent: (content: string) => void;
  onCommandHandled: () => void;
  onSave: () => void;
};

export function MarkDownEditor({
  command,
  content,
  isActive,
  onChangeContent,
  onCommandHandled,
  onSave,
}: MarkDownEditorProps) {
  const { t } = useTranslation();
  const markdownInputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const markdownInput = markdownInputRef.current;

    if (!markdownInput || !isActive) {
      return;
    }

    markdownInput.style.height = "auto";
    markdownInput.style.height = `${markdownInput.scrollHeight}px`;
  }, [content, isActive]);

  useLayoutEffect(() => {
    const markdownInput = markdownInputRef.current;

    if (!command || !markdownInput || !isActive) {
      return;
    }

    const nextSelection = applyEditorCommandToSelection(
      content,
      command,
      markdownInput.selectionStart,
      markdownInput.selectionEnd,
    );

    onChangeContent(nextSelection.content);
    onCommandHandled();
    requestAnimationFrame(() => {
      markdownInput.focus();
      markdownInput.selectionStart = nextSelection.selectionStart;
      markdownInput.selectionEnd = nextSelection.selectionEnd;
    });
  }, [command, content, isActive, onChangeContent, onCommandHandled]);

  const handleMarkdownKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const { selectionEnd, selectionStart, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const selectedText = value.slice(lineStart, selectionEnd);

    if (event.shiftKey) {
      const outdentedText = selectedText.replace(/(^|\n)\t/g, "$1");
      const nextContent =
        value.slice(0, lineStart) + outdentedText + value.slice(selectionEnd);
      const removedLength = selectedText.length - outdentedText.length;

      onChangeContent(nextContent);
      requestAnimationFrame(() => {
        textarea.selectionStart = Math.max(lineStart, selectionStart - 1);
        textarea.selectionEnd = Math.max(lineStart, selectionEnd - removedLength);
      });
      return;
    }

    const indentedText = selectedText.replace(/^|\n/g, "$&\t");
    const nextContent =
      value.slice(0, lineStart) + indentedText + value.slice(selectionEnd);
    const addedLength = indentedText.length - selectedText.length;

    onChangeContent(nextContent);
    requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart + 1;
      textarea.selectionEnd = selectionEnd + addedLength;
    });
  };

  return (
    <div className="grid bg-background">
      <textarea
        aria-label={t("editor.markdownInput")}
        className="block min-h-80 resize-none overflow-hidden border-0 bg-background p-[12px] font-mono text-[16px] leading-[20px] outline-none [tab-size:2]"
        onBlur={onSave}
        onKeyDown={handleMarkdownKeyDown}
        onChange={(event) => onChangeContent(event.target.value)}
        ref={markdownInputRef}
        value={content}
      />
    </div>
  );
}
