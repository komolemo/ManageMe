import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell } from "@/pages/PageShell";

const projects = [
  { name: "ManageMe Core", milestone: "ph-1-0", status: "進行中", progress: 68 },
  { name: "Knowledge Wiki", milestone: "ph-1-0", status: "設計中", progress: 42 },
  { name: "Desktop Shell", milestone: "ph-1-1", status: "レビュー", progress: 81 },
];

export function ProjectListPage() {
  return (
    <PageShell
      badge="Projects / 1"
      title="Project List Page"
      description="対応するProjectページへ遷移するための一覧画面。"
    >
      <div className="px-[32px]">
        <div className="mb-3 flex justify-end">
          <Button size="sm" className="pl-[8px] pr-[16px] py-[4px] rounded-md">
            <Plus className="size-4" />
            New
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 pt-[16px] border-b">
          {projects.map((project) => (
            <Card key={project.name} className="py-[16px] border-t ring-0">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.milestone}</CardDescription>
                <CardAction>
                  <MoreHorizontal className="size-4" />
                </CardAction>
              </CardHeader>
              {/* <CardContent className="grid gap-3">
                <Progress value={project.progress} />
                <Button variant="outline" className="justify-between">
                  Project Pageへ
                  <ChevronRight className="size-4" />
                </Button>
              </CardContent> */}
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
