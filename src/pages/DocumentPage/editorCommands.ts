export type EditorCommand =
  | { id: number; type: "heading"; level: 1 | 2 | 3 };

export function applyEditorCommandToSelection(
  content: string,
  command: EditorCommand,
  selectionStart: number,
  selectionEnd: number,
) {
  if (command.type === "heading") {
    const lineStart = content.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEndIndex = content.indexOf("\n", selectionEnd);
    const lineEnd = lineEndIndex === -1 ? content.length : lineEndIndex;
    const selectedLines = content.slice(lineStart, lineEnd);
    const headingPrefix = `${"#".repeat(command.level)} `;
    const nextLines = selectedLines
      .split("\n")
      .map((line) => `${headingPrefix}${line.replace(/^#{1,6}\s+/, "")}`)
      .join("\n");
    const nextContent =
      content.slice(0, lineStart) + nextLines + content.slice(lineEnd);
    const prefixLengthDelta = nextContent.length - content.length;

    return {
      content: nextContent,
      selectionEnd: selectionEnd + prefixLengthDelta,
      selectionStart: selectionStart + headingPrefix.length,
    };
  }

  return {
    content,
    selectionEnd,
    selectionStart,
  };
}
