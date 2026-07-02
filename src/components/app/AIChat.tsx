import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  author: "ai" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "ai-chat-welcome",
    author: "ai",
    text: "Ask about tasks, project notes, or what to work on next.",
  },
  {
    id: "ai-chat-suggestion",
    author: "ai",
    text: "Try: summarize today's priorities.",
  },
];

type AIChatProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export function AIChat({ isOpen, onClose, onOpen }: AIChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState("");

  const sendMessage = (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        author: "user",
        text: trimmedText,
      },
      {
        id: `ai-${Date.now()}`,
        author: "ai",
        text: "Got it. I am preparing related task and wiki suggestions.",
      },
    ]);
    setMessageText("");
    onOpen();
  };

  return (
    <aside
      aria-label="AI chat sidebar"
      className={`h-full shrink-0 overflow-hidden bg-tab-background text-foreground transition-[width] duration-200 ${
        isOpen ? "w-[320px]" : "w-[0px]"
      }`}
    >
      <div className="flex h-full min-h-0 w-[320px] max-w-none flex-col">
        <div className="flex h-[32px] shrink-0 items-center justify-between gap-[8px] px-[4px]">
          <Button
            aria-label="Back from AI chat"
            className="size-8 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            size="icon-sm"
            type="button"
          >
            <ArrowLeft className="size-[24px] " />
          </Button>
          <Button
            aria-label="Close AI chat"
            className="size-[24px] p-[0px] bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            size="icon-sm"
            type="button"
          >
            <X className="size-[24px]" />
          </Button>
        </div>

        <div className="notification-scrollbar flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-[10px] py-[10px]">

          {messages.map((message) => (
            <div
              className={`flex ${
                message.author === "user" ? "justify-end" : "justify-start"
              }`}
              key={message.id}
            >
              <p
                className={`m-0 max-w-[84%] whitespace-pre-wrap break-words px-[10px] py-[8px] text-xs leading-relaxed ${
                  message.author === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-popover text-popover-foreground dark:bg-popover-2"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 shrink-0 gap-[8px] bg-tabs-background p-[12px]">

          <form
            className="flex min-w-0 flex-col gap-[8px] bg-input/30 p-[8px] rounded-xl"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(messageText);
            }}
          >
            <Input
              aria-label="AI chat message"
              autoComplete="off"
              className="box-border min-h-[40px] max-w-full border-0 bg-transparent dark:bg-transparent"
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Ask AI"
              type="text"
              value={messageText}
            />
            <div className="flex items-center justify-between">
              <Button
                aria-label="Add chat attachment"
                className="size-[30px] bg-transparent rounded-full text-muted-foreground hover:bg-muted hover:text-foreground px-[0px]"
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Plus className="size-[20px]" />
              </Button>
              <Button
                aria-label="Send AI chat message"
                className="size-[30px] rounded-full"
                disabled={!messageText.trim()}
                size="icon-sm"
                type="submit"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
}
