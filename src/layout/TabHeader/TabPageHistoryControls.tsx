import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTabPageHistory } from "@/layout/TabHeader/TabPageHistoryContext";

export function TabPageHistoryControls() {
  const { t } = useTranslation();
  const { canGoBack, canGoForward, goBack, goForward } = useTabPageHistory();

  return (
    <div className="flex h-[29px] shrink-0 items-center gap-1">
      <Button
        aria-label={t("a11y.backTab")}
        className="text-muted-foreground hover:text-foreground"
        disabled={!canGoBack}
        onClick={goBack}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <ArrowLeft className="size-6 text-current" />
      </Button>
      <Button
        aria-label={t("a11y.forwardTab")}
        className="text-muted-foreground hover:text-foreground"
        disabled={!canGoForward}
        onClick={goForward}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <ArrowRight className="size-6 text-current" />
      </Button>
    </div>
  );
}
