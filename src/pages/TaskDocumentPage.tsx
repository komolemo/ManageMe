import { PageShell } from "@/pages/PageShell";
import { useTranslation } from "react-i18next";

export function TaskDocumentPage() {
  const { t } = useTranslation();
  return (
    <PageShell breadcrumbs={[{ label: t("pages.document") }, { label: "3" }]}>
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <textarea
          className="min-h-80 resize-none border bg-background p-[12px] text-xs leading-6 outline-none focus:ring-1 focus:ring-ring"
          defaultValue={"# Overview\n\nIssue ruleに沿ったTask Document本文。\n\n# Purpose\n\n開発状況を英語ドキュメントから参照できるようにする。"}
        />
        <aside className="border bg-muted p-[12px]">
          <p className="mb-3 text-sm font-medium">Sidebar 2</p>
          <div className="grid gap-1 text-xs text-muted-foreground">
            <div className="border bg-card p-[8px]">requirements-eng</div>
            <div className="border bg-card p-[8px]">er-diagram-eng</div>
            <div className="border bg-card p-[8px]">issue-rule-eng</div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
