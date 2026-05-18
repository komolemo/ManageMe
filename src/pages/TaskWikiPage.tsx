import { PageShell } from "@/pages/PageShell";

export function TaskWikiPage() {
  return (
    <PageShell
      badge="Wiki / 3"
      title="Task Page"
      description="Markdown入力と同一Project Wiki内のタスク一覧Sidebar 2を持つ画面。"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <textarea
          className="min-h-80 resize-none border bg-background p-[12px] text-xs leading-6 outline-none focus:ring-1 focus:ring-ring"
          defaultValue={"# Overview\n\nIssue ruleに沿ったTask Wiki本文。\n\n# Purpose\n\n開発状況を英語ドキュメントから参照できるようにする。"}
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
