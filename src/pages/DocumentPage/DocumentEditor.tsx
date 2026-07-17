import { useDocument } from "@/hooks/useDocument";
import { CommandBar } from "@/pages/DocumentPage/CommandBar";
import type { EditorCommand } from "@/pages/DocumentPage/editorCommands";
import { MarkDownEditor } from "@/pages/DocumentPage/MarkDownEditor";
import { TextEditor } from "@/pages/DocumentPage/TextEditor";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DocumentEditorProps = {
  command: EditorCommand | null;
  documentId: string;
  isMarkdownMode: boolean;
  initialContent: string;
  onCommand: (command: Omit<EditorCommand, "id">) => void;
  onCommandHandled: () => void;
};

type CommandBarPosition = {
  left: number;
  top: number;
};

const COMMAND_BAR_GAP = 6;
const COMMAND_BAR_HEIGHT = 36;
const COMMAND_BAR_VIEWPORT_GAP = 4;

function getTextareaSelectionRect(textarea: HTMLTextAreaElement) {
  if (textarea.selectionStart === textarea.selectionEnd) {
    return null;
  }

  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const selection = document.createElement("span");
  const copiedProperties = [
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "borderBottomWidth",
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "textTransform",
    "wordSpacing",
  ] as const;

  copiedProperties.forEach((property) => {
    mirror.style[property] = style[property];
  });

  const textareaRect = textarea.getBoundingClientRect();
  mirror.style.position = "fixed";
  mirror.style.left = `${textareaRect.left - textarea.scrollLeft}px`;
  mirror.style.top = `${textareaRect.top - textarea.scrollTop}px`;
  mirror.style.width = `${textareaRect.width}px`;
  mirror.style.height = "auto";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
  selection.textContent =
    textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || "\u200b";
  mirror.append(selection);
  document.body.append(mirror);

  const selectionRects = Array.from(selection.getClientRects());
  mirror.remove();

  if (!selectionRects.length) {
    return null;
  }

  return {
    left: Math.min(...selectionRects.map((rect) => rect.left)),
    top: Math.min(...selectionRects.map((rect) => rect.top)),
  };
}

export function DocumentEditor({
  command,
  documentId,
  isMarkdownMode,
  initialContent,
  onCommand,
  onCommandHandled,
}: DocumentEditorProps) {
  const { content, saveDocument, setContent } = useDocument({
    documentId,
    initialContent,
  });
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const commandBarRef = useRef<HTMLDivElement>(null);
  const isPointerSelectingRef = useRef(false);
  const [commandBarPosition, setCommandBarPosition] =
    useState<CommandBarPosition | null>(null);
  const [commandBarLeft, setCommandBarLeft] = useState<number | null>(null);

  const updateCommandBarPosition = useCallback(() => {
    const editorContainer = editorContainerRef.current;

    if (!editorContainer) {
      setCommandBarPosition(null);
      return;
    }

    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLTextAreaElement &&
      editorContainer.contains(activeElement)
    ) {
      const rect = getTextareaSelectionRect(activeElement);
      setCommandBarPosition(
        rect
          ? {
              left: rect.left,
              top: rect.top - COMMAND_BAR_HEIGHT - COMMAND_BAR_GAP,
            }
          : null,
      );
      return;
    }

    const selection = window.getSelection();

    if (
      !selection ||
      selection.isCollapsed ||
      !selection.rangeCount ||
      !editorContainer.contains(selection.anchorNode) ||
      !editorContainer.contains(selection.focusNode)
    ) {
      setCommandBarPosition(null);
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setCommandBarPosition({
      left: rect.left,
      top: rect.top - COMMAND_BAR_HEIGHT - COMMAND_BAR_GAP,
    });
  }, []);

  useEffect(() => {
    const updateAfterSelection = () => {
      if (!isPointerSelectingRef.current) {
        requestAnimationFrame(updateCommandBarPosition);
      }
    };
    const updateAfterPointerUp = () => {
      if (!isPointerSelectingRef.current) {
        return;
      }

      isPointerSelectingRef.current = false;
      requestAnimationFrame(updateCommandBarPosition);
    };

    document.addEventListener("selectionchange", updateAfterSelection);
    document.addEventListener("pointerup", updateAfterPointerUp);
    window.addEventListener("resize", updateAfterSelection);
    window.addEventListener("scroll", updateAfterSelection, true);

    return () => {
      document.removeEventListener("selectionchange", updateAfterSelection);
      document.removeEventListener("pointerup", updateAfterPointerUp);
      window.removeEventListener("resize", updateAfterSelection);
      window.removeEventListener("scroll", updateAfterSelection, true);
    };
  }, [updateCommandBarPosition]);

  useEffect(() => {
    setCommandBarPosition(null);
  }, [isMarkdownMode]);

  useLayoutEffect(() => {
    const commandBar = commandBarRef.current;

    if (!commandBarPosition || !commandBar) {
      setCommandBarLeft(null);
      return;
    }

    const maximumLeft =
      window.innerWidth - commandBar.offsetWidth - COMMAND_BAR_VIEWPORT_GAP;
    setCommandBarLeft(
      Math.max(
        COMMAND_BAR_VIEWPORT_GAP,
        Math.min(commandBarPosition.left, maximumLeft),
      ),
    );
  }, [commandBarPosition]);

  return (
    <div
      className="grid gap-3"
      onKeyUp={updateCommandBarPosition}
      onPointerDown={() => {
        isPointerSelectingRef.current = true;
        setCommandBarPosition(null);
      }}
      onSelect={() => {
        if (!isPointerSelectingRef.current) {
          updateCommandBarPosition();
        }
      }}
      ref={editorContainerRef}
    >
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
      {commandBarPosition
        ? createPortal(
            <div
              className="fixed z-50 max-w-[calc(100vw-8px)]"
              onMouseDown={(event) => event.preventDefault()}
              ref={commandBarRef}
              style={{
                left: commandBarLeft ?? commandBarPosition.left,
                top: commandBarPosition.top,
              }}
            >
              <CommandBar
                onCommand={onCommand}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
