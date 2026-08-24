import { defaultValueCtx, Editor, rootCtx } from "@milkdown/kit/core";
import { indent, indentConfig } from "@milkdown/kit/plugin/indent";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import "@milkdown/kit/prose/view/style/prosemirror.css";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { useEffect } from "react";
import type { EditorCommand } from "@/pages/DocumentPage/editorCommands";

const textEditorIndentConfig = { size: 1, type: "tab" } as const;

type TextEditorProps = {
  command: EditorCommand | null;
  content: string;
  onChangeContent: (content: string) => void;
  onCommandHandled: () => void;
  onSave: () => void;
};

function MilkdownTextEditor({
  command,
  content,
  onChangeContent,
  onCommandHandled,
}: TextEditorProps) {
  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx.set(indentConfig.key, textEditorIndentConfig);
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            onChangeContent(markdown);
          });
        })
        .use(commonmark)
        .use(gfm)
        .use(indent)
        .use(listener),
    [],
  );

  useEffect(() => {
    if (!command) {
      return;
    }

    onCommandHandled();
  }, [command, onCommandHandled]);

  return <Milkdown />;
}

export function TextEditor(props: TextEditorProps) {
  return (
    <div
      className="milkdown-editor min-h-80 p-[12px] text-[16px] leading-6 [tab-size:4]"
      onBlur={props.onSave}
    >
      <MilkdownProvider>
        <MilkdownTextEditor {...props} />
      </MilkdownProvider>
    </div>
  );
}
