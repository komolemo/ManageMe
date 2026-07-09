import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type KeyboardEvent, useLayoutEffect, useRef } from "react";
import { useDocument } from "@/hooks/useDocument";

type DocumentEditorProps = {
  documentId: string;
  isMarkdownMode: boolean;
  initialContent: string;
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
    <div className="grid gap-3">
      {isMarkdownMode ? (
        <div className="grid bg-background">
          <textarea
            aria-label="Markdown input"
            className="min-h-80 w-full resize-none overflow-hidden border-0 bg-background p-2 text-[16px] font-sans leading-6 outline-none [tab-size:2]"
            onBlur={saveDocument}
            onKeyDown={handleMarkdownKeyDown}
            onChange={(event) => setContent(event.target.value)}
            ref={markdownInputRef}
            value={content}
          />
        </div>
      ) : (
        <div className="markdown-preview min-h-80 p-[12px] text-[16px] font-sans leading-5 [tab-size:4]">
          <ReactMarkdown
            components={{
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-border pl-3 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => (
                <h1 className="mb-3 mt-5 font-heading text-[28px] font-semibold leading-9 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-2 mt-5 font-heading text-[24px] font-semibold leading-8 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-4 font-heading text-[20px] font-semibold leading-7 first:mt-0">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="mb-2 mt-4 font-heading text-[18px] font-semibold leading-7 first:mt-0">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="mb-1 mt-3 font-heading text-[16px] font-semibold leading-6 first:mt-0">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="mb-1 mt-3 font-heading text-[14px] font-semibold leading-6 text-muted-foreground first:mt-0">
                  {children}
                </h6>
              ),
              code: ({ children }) => (
                <code className="inline-block rounded-sm border border-border bg-[#000] px-1.5 py-0.5 font-mono text-[14px] leading-5 text-white">
                  {children}
                </code>
              ),
              input: ({ type, ...props }) => (
                <input
                  className="mr-1 align-[-2px]"
                  type={type}
                  {...props}
                />
              ),
              li: ({ children, className }) => (
                <li
                  className={`${className ?? ""} pl-1 leading-5 [&>ol]:my-0 [&>p]:my-0 [&>ul]:my-0`}
                >
                  {children}
                </li>
              ),
              ol: ({ children }) => (
                <ol className="my-1 space-y-0">
                  {children}
                </ol>
              ),
              p: ({ children }) => (
                <p className="my-3 whitespace-pre-wrap leading-5">{children}</p>
              ),
              pre: ({ children }) => (
                <pre className="my-2 overflow-x-auto rounded-sm border border-border bg-[#000] px-2 py-1 font-mono text-[14px] leading-5 text-white">
                  {children}
                </pre>
              ),
              ul: ({ children, className }) => (
                <ul className={`${className ?? ""} my-1 space-y-0`}>
                  {children}
                </ul>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {preserveConsecutiveBlankLines(content)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
