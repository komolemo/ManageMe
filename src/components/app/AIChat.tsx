import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

type ChatMessage = {
  id: string;
  author: "ai" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "user-hello",
    author: "user",
    text: "Ask about tasks, project notes, or what to work on next.",
  },
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
  {
    id: "ai-chat-suggestion-1",
    author: "ai",
    text: "Try: summarize today's priorities.",
  },
  {
    id: "user-hello-2",
    author: "user",
    text: "Ask about tasks, project notes, or what to work on next.",
  },
  {
    id: "ai-chat-suggestion-2",
    author: "ai",
    text: "Try: summarize today's priorities.",
  },
  {
    id: "user-hello-3",
    author: "user",
    text: "Ask about tasks, project notes, or what to work on next.",
  },
];

const MIN_CHAT_WIDTH = 240;
const MAX_CHAT_WIDTH = 640;
const DEFAULT_CHAT_WIDTH = 320;

type AIChatProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export function AIChat({ isOpen, onClose, onOpen }: AIChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState("");
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef({
    pointerX: 0,
    width: DEFAULT_CHAT_WIDTH,
  });

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (!messagesContainer) {
      return;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages.length]);

  const resizeChat = (pointerX: number) => {
    const maxWidth = Math.max(
      MIN_CHAT_WIDTH,
      Math.min(MAX_CHAT_WIDTH, window.innerWidth - 160),
    );
    const nextWidth =
      resizeStartRef.current.width + resizeStartRef.current.pointerX - pointerX;

    setChatWidth(Math.min(Math.max(nextWidth, MIN_CHAT_WIDTH), maxWidth));
  };

  const startResizing = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStartRef.current = {
      pointerX: event.clientX,
      width: chatWidth,
    };
  };

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
        text: "Got it. I am preparing related task and document suggestions.",
      },
    ]);
    setMessageText("");
    onOpen();
  };

  return (
    <aside
      aria-label={t("ai.sidebar")}
      className="flex h-full shrink-0 overflow-hidden bg-tab-background text-foreground"
      style={{ width: isOpen ? `${chatWidth}px` : "0px" }}
    >
      <div
        aria-label={t("ai.resize")}
        className="h-full w-[6px] shrink-0 cursor-col-resize bg-transparent hover:bg-border"
        onPointerDown={startResizing}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            resizeChat(event.clientX);
          }
        }}
        role="separator"
      />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-[32px] shrink-0 items-center justify-between gap-2 px-[10px]">
          <Button
            aria-label={t("ai.back")}
            className="size-6 p-0 border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            size="icon-sm"
            type="button"
          >
            <ArrowLeft className="size-6 " />
          </Button>
          <Button
            aria-label={t("ai.close")}
            className="size-6 p-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            size="icon-sm"
            type="button"
          >
            <X className="size-6" />
          </Button>
        </div>

        <div
          className="notification-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-[16px] py-[10px]"
          ref={messagesContainerRef}
        >

          {messages.map((message) => (
            <div
              className={`flex ${
                message.author === "user" ? "justify-end " : "justify-start border-t"
              }`}
              key={message.id}
            >
              <p
                className={`m-0 max-w-[84%] whitespace-pre-wrap break-words py-2 text-[14px] leading-relaxed ${
                  message.author === "user"
                    ? "bg-input/30 text-foreground rounded-xl px-3"
                    : "bg-transparent text-popover-foreground/80 dark:bg-transparent"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 shrink-0 gap-2 bg-tabs-background p-3">

          <form
            className="flex min-w-0 flex-col gap-2 bg-input/30 p-2 rounded-xl"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(messageText);
            }}
          >
            <Input
              aria-label={t("ai.message")}
              autoComplete="off"
              className="box-border min-h-10 max-w-full border-0 bg-transparent text-[14px] focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              onChange={(event) => setMessageText(event.target.value)}
              placeholder={t("ai.ask")}
              type="text"
              value={messageText}
            />
            <div className="flex items-center justify-between">
              <Button
                aria-label={t("ai.addAttachment")}
                className="size-7.5 bg-transparent rounded-full text-muted-foreground hover:bg-muted hover:text-foreground px-0"
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Plus className="size-5" />
              </Button>
              <Button
                aria-label={t("ai.send")}
                className="size-7.5 rounded-full"
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
