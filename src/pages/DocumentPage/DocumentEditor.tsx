import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type KeyboardEvent, useLayoutEffect, useRef } from "react";
import { useDocument } from "@/hooks/useDocument";

type DocumentEditorProps = {
  documentId: string;
  isMarkdownMode: boolean;
  initialContent: string;
};

export function DocumentEditor({
  documentId,
  isMarkdownMode,
  initialContent,
}: DocumentEditorProps) {
  const markdownInputRef = useRef<HTMLTextAreaElement>(null);
  const { content, saveDocument, setContent } = useDocument({
    documentId,
    initialContent,
  });

  useLayoutEffect(() => {
    const markdownInput = markdownInputRef.current;

    if (!markdownInput || !isMarkdownMode) {
      return;
    }

    markdownInput.style.height = "auto";
    markdownInput.style.height = `${markdownInput.scrollHeight}px`;
  }, [content, isMarkdownMode]);

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

      setContent(nextContent);
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

    setContent(nextContent);
    requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart + 1;
      textarea.selectionEnd = selectionEnd + addedLength;
    });
  };

  return (
    <div className="grid gap-[12px]">
      {isMarkdownMode ? (
        <div className="grid bg-background md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <textarea
            aria-label="Markdown input"
            className="min-h-80 resize-none overflow-hidden border-0 bg-background p-[12px] text-[16px] leading-6 outline-none [tab-size:4]"
            onBlur={saveDocument}
            onKeyDown={handleMarkdownKeyDown}
            onChange={(event) => setContent(event.target.value)}
            ref={markdownInputRef}
            value={content}
          />
        </div>
      ) : (
        <div className="min-h-80 p-[12px] text-[16px] leading-6 [tab-size:4]">
          <ReactMarkdown
            components={{
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              input: ({ type, ...props }) => (
                <input
                  className="mr-2 align-[-2px]"
                  type={type}
                  {...props}
                />
              ),
              li: ({ children }) => (
                <li className="pl-1 whitespace-pre-wrap [&:has(>input[type='checkbox'])]:list-none [&:has(>input[type='checkbox'])]:pl-0">
                  {children}
                </li>
              ),
              ol: ({ children }) => (
                <ol className="my-2 list-decimal space-y-1 pl-6">
                  {children}
                </ol>
              ),
              p: ({ children }) => (
                <p className="my-1 whitespace-pre-wrap">{children}</p>
              ),
              ul: ({ children, className }) => (
                <ul
                  className={
                    className?.includes("contains-task-list")
                      ? "my-2 list-none space-y-1 pl-0"
                      : "my-2 list-disc space-y-1 pl-6"
                  }
                >
                  {children}
                </ul>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
