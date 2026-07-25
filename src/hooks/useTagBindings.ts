import { useCallback, useEffect, useRef, useState } from "react";
import { tagApi } from "@/features/tag/tagApi";
import { tagBindApi } from "@/features/tag/tagBindApi";
import { useTagStore } from "@/features/tag/tagStore";
import type { Tag } from "@/features/tag/types";

type TagBindingTarget = {
  documentId?: string;
  taskId?: string;
};

const normalize = (name: string) => name.trim().toLocaleLowerCase();

async function resolveTag(name: string, knownTags: Tag[]) {
  const normalizedName = normalize(name);
  const known = knownTags.find(
    (tag) =>
      !tag.tagId.startsWith("pending:") &&
      normalize(tag.name) === normalizedName,
  );
  if (known) return known;

  const exact = (await tagApi.search(name.trim(), 5)).find(
    (tag) => normalize(tag.name) === normalizedName,
  );
  if (exact) return exact;

  try {
    return await useTagStore.getState().createTag({
      colorId: null,
      description: "",
      name: name.trim(),
      tagId: crypto.randomUUID(),
    });
  } catch (error) {
    // Another view may have created the same uniquely named tag concurrently.
    const concurrent = (await tagApi.search(name.trim(), 5)).find(
      (tag) => normalize(tag.name) === normalizedName,
    );
    if (concurrent) return concurrent;
    throw error;
  }
}

export function useTagBindings({ documentId, taskId }: TagBindingTarget) {
  const [tags, setTagsState] = useState<Tag[]>([]);
  const tagsRef = useRef<Tag[]>([]);
  const saveQueue = useRef(Promise.resolve());
  const targetKey = taskId ? `task:${taskId}` : documentId ? `document:${documentId}` : "";

  useEffect(() => {
    let cancelled = false;
    tagsRef.current = [];
    setTagsState([]);
    saveQueue.current = Promise.resolve();

    const request = taskId
      ? tagBindApi.listByTask(taskId)
      : documentId
        ? tagBindApi.listByDocument(documentId)
        : Promise.resolve([]);

    void request
      .then((loadedTags) => {
        if (!cancelled) {
          tagsRef.current = loadedTags;
          setTagsState(loadedTags);
        }
      })
      .catch(() => {
        if (!cancelled) {
          tagsRef.current = [];
          setTagsState([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, targetKey, taskId]);

  const setTags = useCallback(
    (names: string[]) => {
      const uniqueNames = names
        .map((name) => name.trim())
        .filter(
          (name, index, values) =>
            name.length > 0 &&
            values.findIndex((value) => normalize(value) === normalize(name)) === index,
        );
      const optimisticTags = uniqueNames.map((name) => {
        return (
          tagsRef.current.find(
            (tag) => normalize(tag.name) === normalize(name)
          ) ?? {
            colorId: null,
            createdAt: "",
            description: "",
            lastUsedAt: null,
            name,
            tagId: `pending:${normalize(name)}`,
            updatedAt: "",
          }
        );
      });
      tagsRef.current = optimisticTags;
      setTagsState(optimisticTags);

      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          if (!taskId && !documentId) return;
          const resolved: Tag[] = [];
          for (const name of uniqueNames) {
            resolved.push(await resolveTag(name, [...tagsRef.current, ...resolved]));
          }
          const saved = taskId
            ? await tagBindApi.replaceTask(
                taskId,
                resolved.map((tag) => tag.tagId),
              )
            : await tagBindApi.replaceDocument(
                documentId!,
                resolved.map((tag) => tag.tagId),
              );
          tagsRef.current = saved;
          setTagsState(saved);
        });
    },
    [documentId, taskId],
  );

  return { setTags, tags: tags.map((tag) => tag.name) };
}
