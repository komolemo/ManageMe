import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tagColorById, tagColors } from "@/features/tag/tagColors";
import { useTagStore } from "@/features/tag/tagStore";
import type { Tag } from "@/features/tag/types";

const pageSize = 50;
const defaultTagColor = tagColors[0].id;

export type TagSortKey = "tag" | "color" | "lastUsed";
export type TagPaginationEntry =
  | number
  | "start-ellipsis"
  | "end-ellipsis";

function getPaginationEntries(
  currentPage: number,
  totalPages: number,
): TagPaginationEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ];
}

function useTagManagerState() {
  const tags = useTagStore((state) => state.tags);
  const isLoading = useTagStore((state) => state.isLoading);
  const error = useTagStore((state) => state.error);
  const loadTags = useTagStore((state) => state.loadTags);
  const createTagInStore = useTagStore((state) => state.createTag);
  const deleteTagInStore = useTagStore((state) => state.deleteTag);
  const updateTag = useTagStore((state) => state.updateTag);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<TagSortKey>("tag");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(defaultTagColor);
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null);

  useEffect(() => {
    void loadTags(true).catch(() => undefined);
  }, [loadTags]);

  const sortedTags = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredTags = normalizedQuery
      ? tags.filter((tag) => {
          const colorName =
            tag.colorId === null
              ? ""
              : tagColorById.get(tag.colorId)?.name ?? "";
          return [tag.name, colorName, tag.lastUsedAt ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        })
      : tags;

    return [...filteredTags].sort((firstTag, secondTag) => {
      if (sortKey === "lastUsed") {
        return (secondTag.lastUsedAt ?? "").localeCompare(
          firstTag.lastUsedAt ?? "",
        );
      }
      if (sortKey === "color") {
        return (
          (firstTag.colorId ?? Number.MAX_SAFE_INTEGER) -
          (secondTag.colorId ?? Number.MAX_SAFE_INTEGER)
        );
      }
      return firstTag.name.localeCompare(secondTag.name);
    });
  }, [searchQuery, sortKey, tags]);

  const totalPages = Math.max(1, Math.ceil(sortedTags.length / pageSize));
  const currentPageNumber = Math.min(currentPage, totalPages);
  const pageStart = (currentPageNumber - 1) * pageSize;
  const visibleTags = sortedTags.slice(pageStart, pageStart + pageSize);
  const visibleStart = sortedTags.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, sortedTags.length);
  const paginationEntries = getPaginationEntries(
    currentPageNumber,
    totalPages,
  );

  const changeSearchInput = (value: string) => {
    setSearchInput(value);
    if (!value) {
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const changeSort = (value: TagSortKey) => {
    setSortKey(value);
    setCurrentPage(1);
  };

  const resetCreateDialog = () => {
    setNewTagName("");
    setNewTagColor(defaultTagColor);
    setIsCreateDialogOpen(false);
  };

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name || isCreating) return;

    setIsCreating(true);
    try {
      await createTagInStore({
        tagId: crypto.randomUUID(),
        name,
        colorId: newTagColor,
        description: "",
      });
      resetCreateDialog();
    } catch {
      // The store exposes backend errors through `error`.
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteTag = async () => {
    if (!tagToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTagInStore(tagToDelete.tagId);
      setTagToDelete(null);
    } catch {
      // The store exposes backend errors through `error`.
    } finally {
      setIsDeleting(false);
    }
  };

  const changeTagColor = async (tag: Tag, colorId: number) => {
    if (tag.colorId === colorId || updatingTagId === tag.tagId) return;

    setUpdatingTagId(tag.tagId);
    try {
      await updateTag(tag.tagId, {
        name: tag.name,
        colorId,
        description: tag.description,
      });
    } catch {
      // The store exposes backend errors through `error`.
    } finally {
      setUpdatingTagId(null);
    }
  };

  const changeTagName = async (tag: Tag, name: string) => {
    const nextName = name.trim();
    if (!nextName || nextName === tag.name) return;

    try {
      await updateTag(tag.tagId, {
        name: nextName,
        colorId: tag.colorId,
        description: tag.description,
      });
    } catch {
      // The store exposes backend errors through `error`.
    }
  };

  return {
    changeSearchInput,
    changeSort,
    changeTagColor,
    changeTagName,
    confirmDeleteTag,
    createTag,
    currentPage: currentPageNumber,
    error,
    isCreateDialogOpen,
    isCreating,
    isDeleting,
    isLoading,
    newTagColor,
    newTagName,
    paginationEntries,
    resetCreateDialog,
    search,
    searchInput,
    setCurrentPage,
    setIsCreateDialogOpen,
    setNewTagColor,
    setNewTagName,
    setTagToDelete,
    sortKey,
    tagCount: sortedTags.length,
    tags,
    tagToDelete,
    totalPages,
    updatingTagId,
    visibleEnd,
    visibleStart,
    visibleTags,
  };
}

type TagManagerContextValue = ReturnType<typeof useTagManagerState>;

const TagManagerContext = createContext<TagManagerContextValue | null>(null);

export function TagManagerProvider({ children }: { children: ReactNode }) {
  const value = useTagManagerState();

  return createElement(TagManagerContext.Provider, { value }, children);
}

export function useTagManager() {
  const context = useContext(TagManagerContext);

  if (!context) {
    throw new Error("useTagManager must be used within TagManagerProvider");
  }

  return context;
}
