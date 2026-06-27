import { useCallback, useState, type DragEvent } from "react";

export type DropPosition = "before" | "after";

type DragPreview = {
  itemId: string;
  left: number;
  offsetY: number;
  top: number;
  width: number;
};

const transparentDragImage = new Image();
transparentDragImage.src =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export function useSettingsListDragAndDrop(
  onReorderItem: (
    sourceItemId: string,
    targetItemId: string,
    position: DropPosition
  ) => void
) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>("after");

  const clearDragState = useCallback(() => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragPreview(null);
    setDropPosition("after");
  }, []);

  const handleDragStart = useCallback((
    event: DragEvent<HTMLButtonElement>,
    itemId: string,
    itemElement: HTMLDivElement | null
  ) => {
    setDraggedItemId(itemId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);

    if (itemElement) {
      const rect = itemElement.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;

      setDragPreview({
        itemId,
        left: rect.left,
        offsetY,
        top: event.clientY - offsetY,
        width: rect.width,
      });
      event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
    }
  }, []);

  const handleDrag = useCallback((event: DragEvent<HTMLElement>) => {
    if (event.clientY === 0) {
      return;
    }

    setDragPreview((currentDragPreview) =>
      currentDragPreview
        ? {
            ...currentDragPreview,
            top: event.clientY - currentDragPreview.offsetY,
          }
        : currentDragPreview
    );
  }, []);

  const handleDragOver = useCallback((
    event: DragEvent<HTMLDivElement>,
    itemId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";

    const rect = event.currentTarget.getBoundingClientRect();
    const nextDropPosition =
      event.clientY > rect.top + rect.height / 2 ? "after" : "before";

    handleDrag(event);
    setDragOverItemId(itemId);
    setDropPosition(nextDropPosition);
  }, [handleDrag]);

  const handleDrop = useCallback((
    event: DragEvent<HTMLDivElement>,
    targetItemId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceItemId =
      draggedItemId ?? event.dataTransfer.getData("text/plain");

    if (sourceItemId && sourceItemId !== targetItemId) {
      onReorderItem(sourceItemId, targetItemId, dropPosition);
    }

    clearDragState();
  }, [clearDragState, draggedItemId, dropPosition, onReorderItem]);

  return {
    clearDragState,
    dragPreview,
    draggedItemId,
    dragOverItemId,
    handleDrag,
    dropPosition,
    handleDragOver,
    handleDragStart,
    handleDrop,
  };
}
