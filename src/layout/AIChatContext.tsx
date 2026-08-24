import { createContext, useContext } from "react";

type AIChatContextValue = {
  isOpen: boolean;
  onToggle: () => void;
};

const AIChatContext = createContext<AIChatContextValue | null>(null);

export const AIChatProvider = AIChatContext.Provider;

export function useAIChat() {
  return useContext(AIChatContext);
}
