import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLayoutEffect, useRef } from "react";
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

  return (
    <div className="grid gap-[12px]">
      {isMarkdownMode ? (
        <div className="grid bg-background md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <textarea
            aria-label="Markdown input"
            className="min-h-80 resize-none overflow-hidden border-0 bg-background p-[12px] text-xs leading-6 outline-none"
            onBlur={saveDocument}
            onChange={(event) => setContent(event.target.value)}
            ref={markdownInputRef}
            value={content}
          />
        </div>
      ) : (
        <div className="min-h-80 p-[12px] text-xs leading-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
