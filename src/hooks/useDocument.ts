import { useCallback, useEffect, useRef, useState } from "react";

type UseDocumentOptions = {
  commitDelay?: number;
  documentId: string;
  initialContent: string;
  onSave?: (content: string) => void;
};

export function useDocument({
  commitDelay = 700,
  documentId,
  initialContent,
  onSave,
}: UseDocumentOptions) {
  const [content, setContent] = useState(initialContent);
  const savedContentRef = useRef(initialContent);

  useEffect(() => {
    setContent(initialContent);
    savedContentRef.current = initialContent;
  }, [documentId]);

  const saveDocument = useCallback(() => {
    onSave?.(content);
    savedContentRef.current = content;
  }, [content, onSave]);

  useEffect(() => {
    if (content === savedContentRef.current) {
      return;
    }

    const timerId = window.setTimeout(saveDocument, commitDelay);

    return () => window.clearTimeout(timerId);
  }, [commitDelay, content, saveDocument]);

  return {
    content,
    isDirty: content !== savedContentRef.current,
    saveDocument,
    setContent,
  };
}
