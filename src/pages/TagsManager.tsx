import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Tag } from "lucide-react";
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

const pageSize = 50;

type TagsManagerProps = {
  onSelectTag: (tagId: string) => void;
};

export function TagsManager({ onSelectTag }: TagsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTags = useMemo(() => {
    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter((tag) =>
      [tag.name, tag.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const boundedPage = Math.min(currentPage, totalPages);
  const pageStart = (boundedPage - 1) * pageSize;
  const visibleTags = filteredTags.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredTags.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredTags.length);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <PageShell
      badge="Tags / 1"
      title="Tags Manager"
      description=""
    >
      <div className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-[10px] top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Tag search"
              className="pl-[32px]"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search tags"
              type="search"
              value={searchQuery}
            />
          </div>
          <Button size="sm" type="button">
            <Plus className="size-4" />
            New
          </Button>
        </div>

        <div className="border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTags.length > 0 ? (
                visibleTags.map((tag) => (
                  <TableRow
                    className="cursor-pointer"
                    key={tag.id}
                    onClick={() => onSelectTag(tag.id)}
                  >
                    <TableCell>
                      <span className="flex min-w-0 items-center gap-2">
                        <Tag className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{tag.name}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tag.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {tag.linkedSets.length + tag.linkedWikis.length}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-[96px] text-center text-muted-foreground"
                    colSpan={3}
                  >
                    No tags found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {visibleStart}-{visibleEnd} of {filteredTags.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Previous tag page"
              disabled={boundedPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[72px] text-center">
              {boundedPage} / {totalPages}
            </span>
            <Button
              aria-label="Next tag page"
              disabled={boundedPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
