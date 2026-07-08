import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { ArrowLeft, BookOpenText, Layers, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableName1 } from "@/components/app/EditableName";
import { TagColorPalette } from "@/components/app/TagColorPalette";
import { PageShell } from "@/pages/PageShell";
import { tagColors, tags } from "@/pages/tagsData";

const tagColorById = new Map(tagColors.map((color) => [color.id, color]));
const defaultTagColorId = tagColors[0].id;

function resolveTagColorId(colorId: number) {
  return tagColorById.has(colorId) ? colorId : defaultTagColorId;
}

type TagSettingProps = {
  tagId: string;
  onBack: () => void;
  onBackInNewTab: () => void;
};

export function TagSetting({
  tagId,
  onBack,
  onBackInNewTab,
}: TagSettingProps) {
  const tag = tags.find((item) => item.id === tagId) ?? tags[0];
  const [selectedTagColorId, setSelectedTagColorId] = useState(() =>
    resolveTagColorId(tag.color),
  );
  const [draftTagColorId, setDraftTagColorId] = useState(selectedTagColorId);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const tagColor = tagColorById.get(selectedTagColorId);
  const [tagName, setTagName] = useState(tag.name);

  useEffect(() => {
    const nextTagColorId = resolveTagColorId(tag.color);

    setSelectedTagColorId(nextTagColorId);
    setDraftTagColorId(nextTagColorId);
    setIsColorDialogOpen(false);
    setTagName(tag.name);
  }, [tag.color, tag.name]);

  const handleColorDialogOpenChange = (open: boolean) => {
    if (open) {
      setDraftTagColorId(selectedTagColorId);
      setIsColorDialogOpen(true);
      return;
    }

    setSelectedTagColorId(draftTagColorId);
    setIsColorDialogOpen(false);
  };

  const openBackPageWithMouseWheel = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onBackInNewTab();
  };

  return (
    <PageShell
      breadcrumbs={[
        {
          label: "Tags",
          onClick: onBack,
          onAuxClick: openBackPageWithMouseWheel,
        },
        { label: "2" },
      ]}
    >
      <div className="grid gap-2">
        <div>
          <Button
            className="
              pl-1 pr-2 py-1 rounded-md
              border-0 bg-transparent
              text-muted-foreground hover:text-foreground
            "
            onAuxClick={openBackPageWithMouseWheel}
            onClick={onBack} size="sm" type="button" variant="outline"
          >
            <ArrowLeft className="size-6" />
            Tags
          </Button>
        </div>

        <section className="flex max-w-xl gap-2">
          <button
            aria-label="Change tag color"
            className="flex size-8 m-[2px] p-1 border-0 shrink-0 items-center justify-center rounded-full bg-transparent text-current hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => setIsColorDialogOpen(true)}
            type="button"
          >
            <Tag
              className=""
              style={{
                color: tagColor?.value,
                fill: tagColor?.backgroundValue,
              }}
            />
          </button>
          <EditableName1
            name={tagName}
            onSaveEditing={setTagName}
          />
        </section>

        <section className="grid gap-1">
          <div className="flex items-center justify-between">
            <h2 className="flex my-2 items-center gap-2 text-base font-semibold">
              <Layers className="size-6" />
              Linked task & wiki sets
            </h2>
            <Badge className="border-0" variant="outline">{tag.linkedSets.length}</Badge>
          </div>
          <div className="ml-4 border-y">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Task</TableHead>
                  <TableHead>Wiki</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tag.linkedSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="py-1 font-medium">{set.task}</TableCell>
                    <TableCell className="py-1 text-muted-foreground">
                      {set.wikiSet}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="grid gap-1">
          <div className="flex items-center justify-between">
            <h2 className="flex my-2 items-center gap-2 text-base font-semibold">
              <BookOpenText className="size-6" />
              Linked wikis
            </h2>
            <Badge className="border-0" variant="outline">{tag.linkedWikis.length}</Badge>
          </div>
          <div className="ml-4 border-y">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Wiki</TableHead>
                  <TableHead>Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tag.linkedWikis.map((wiki) => (
                  <TableRow key={wiki.id}>
                    <TableCell className="py-1 font-medium">{wiki.title}</TableCell>
                    <TableCell className="py-1 text-muted-foreground">
                      {wiki.scope}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
      <Dialog
        open={isColorDialogOpen}
        onOpenChange={handleColorDialogOpenChange}
      >
        <DialogContent className="p-4 gap-4 max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="my-1 text-lg font-semibold leading-[18px] tracking-[0.02em] uppercase">
              Tag color
            </DialogTitle>
            <DialogDescription className="my-1 text-base text-muted-foreground">
              Select a color for this tag.
            </DialogDescription>
          </DialogHeader>
          <TagColorPalette
            selectedColorId={draftTagColorId}
            onColorChange={setDraftTagColorId}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
