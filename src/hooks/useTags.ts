import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { TagRecord } from "@/pages/tagsData";

type CreateTagInput = {
  color: number;
  name: string;
  now?: Date;
};

export function createTagRecord({
  color,
  name,
  now = new Date(),
}: CreateTagInput): TagRecord | null {
  const nextTagName = name.trim();

  if (!nextTagName) {
    return null;
  }

  return {
    id: `tag-${now.getTime()}`,
    name: nextTagName,
    color,
    description: "",
    lastUsed: now.toISOString().slice(0, 10),
    linkedSets: [],
    linkedDocuments: [],
  };
}

export function useCreateTag(
  setTagItems: Dispatch<SetStateAction<TagRecord[]>>
) {
  return useCallback(
    (input: CreateTagInput) => {
      const nextTag = createTagRecord(input);

      if (!nextTag) {
        return null;
      }

      setTagItems((currentTags) => [nextTag, ...currentTags]);

      return nextTag;
    },
    [setTagItems]
  );
}
