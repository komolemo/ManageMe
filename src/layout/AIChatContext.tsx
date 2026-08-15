import { createContext, useContext } from "react";

const AIChatOpenContext = createContext<(() => void) | null>(null);

export const AIChatOpenProvider = AIChatOpenContext.Provider;

export function useOpenAIChat() {
  return useContext(AIChatOpenContext);
}
