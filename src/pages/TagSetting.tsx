import { ArrowLeft, BookOpenText, Layers, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageShell } from "@/pages/PageShell";
import { tags } from "@/pages/tagsData";

type TagSettingProps = {
  tagId: string;
  onBack: () => void;
};

export function TagSetting({ tagId, onBack }: TagSettingProps) {
  const tag = tags.find((item) => item.id === tagId) ?? tags[0];

  return (
    <PageShell
      badge="Tags / 2"
      title="Tag Settings"
      description=""
    >
      <div className="grid gap-4">
        <div>
          <Button onClick={onBack} size="sm" type="button" variant="outline">
            <ArrowLeft className="size-4" />
            Tags
          </Button>
        </div>

        <section className="grid max-w-xl gap-2">
          <label
            className="flex items-center gap-2 text-xs font-medium"
            htmlFor="tag-name"
          >
            <Tag className="size-4" />
            Tag name
          </label>
          <Input id="tag-name" defaultValue={tag.name} />
        </section>

        <section className="grid gap-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="size-4" />
              Linked task & wiki sets
            </h2>
            <Badge variant="outline">{tag.linkedSets.length}</Badge>
          </div>
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Wiki Set</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tag.linkedSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium">{set.task}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {set.wikiSet}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="grid gap-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpenText className="size-4" />
              Linked wikis
            </h2>
            <Badge variant="outline">{tag.linkedWikis.length}</Badge>
          </div>
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wiki</TableHead>
                  <TableHead>Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tag.linkedWikis.map((wiki) => (
                  <TableRow key={wiki.id}>
                    <TableCell className="font-medium">{wiki.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {wiki.scope}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
