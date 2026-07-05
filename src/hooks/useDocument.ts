import { useCallback, useEffect, useRef, useState } from "react";

type UseDocumentOptions = {
  commitDelay?: number;
  documentId: string;
  initialContent: string;
};

export function useDocument({
  commitDelay = 700,
  documentId,
  initialContent,
}: UseDocumentOptions) {
  const [content, setContent] = useState(initialContent);
  const savedContentRef = useRef(initialContent);

  useEffect(() => {
    setContent(initialContent);
    savedContentRef.current = initialContent;
  }, [documentId, initialContent]);

  const saveDocument = useCallback(() => {
    savedContentRef.current = content;
  }, [content]);

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
