import { FileText, ListTodo } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Revision } from "@/features/revision/types";
import { formatRevisionTime } from "@/pages/TopPage/formatRevisionTime";

type HistoryItemProps = {
  kind: Revision["kind"];
  onOpen: () => void;
  time: string;
  title: string;
};

type HistoryItemListProps = {
  histories: Revision[];
  onOpenDocument: (documentId: string) => void;
  onOpenTask: (taskId: string) => void;
};

export function HistoryItemList({
  histories,
  onOpenDocument,
  onOpenTask,
}: HistoryItemListProps) {
  return (
    <div className="grid border-t">
      {histories.map((history) => (
        <HistoryItem
          key={`${history.kind}-${history.id}`}
          kind={history.kind}
          onOpen={() => {
            if (history.kind === "task") {
              onOpenTask(history.id);
            } else {
              onOpenDocument(history.id);
            }
          }}
          time={history.updatedAt}
          title={history.title}
        />
      ))}
    </div>
  );
}

export function HistoryItem({
  kind,
  onOpen,
  time,
  title,
}: HistoryItemProps) {
  const { i18n, t } = useTranslation();
  const PageIcon = kind === "task" ? ListTodo : FileText;
  const label = kind === "task" ? t("search.issue") : t("search.document");
  const translatedTime = formatRevisionTime(time, i18n.language);

  return (
    <button
      className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-foreground"
      onClick={onOpen}
      type="button"
    >
      <Card className="border-b py-4 ring-0 transition-colors hover:bg-muted/50">
        <CardContent className="flex min-w-0 items-center gap-[12px] px-2">
          <PageIcon className="size-8 shrink-0 text-current" aria-hidden="true" />
          <span className="grid min-w-0">
            <span className="flex min-w-0 items-center gap-[6px]">
              <span className="truncate text-[16px]" title={title}>
                {title}
              </span>
              <Badge className="h-[18px] shrink-0 rounded-full border-2 px-[8px] pb-[2px] text-[10px]" variant="outline">
                {label}
              </Badge>
            </span>
            <span className="text-[14px] text-muted-foreground">
              {translatedTime}
            </span>
          </span>
        </CardContent>
      </Card>
    </button>
  );
}
