import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { applyTheme } from "@/lib/theme";

export function useAppAppearance() {
  const theme = useSettings((state) => state.theme);
  const zoomLevel = useSettings((state) => state.zoomLevel);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.zoom = `${zoomLevel}%`;
    return () => {
      document.documentElement.style.zoom = "";
    };
  }, [zoomLevel]);
}
