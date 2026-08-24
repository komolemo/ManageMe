import {
  useCallback,
  useId,
  useState,
  type PointerEvent,
} from "react";

export type DropPosition = "before" | "after";

type DragPreview = {
  itemId: string;
  left: number;
  offsetY: number;
  top: number;
  width: number;
};

export function useSettingsListDragAndDrop(
  onReorderItem: (
    sourceItemId: string,
    targetItemId: string,
    position: DropPosition,
  ) => void,
) {
  const dragGroupId = useId();
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

  const findTarget = useCallback((clientX: number, clientY: number) => {
    const elements = document.elementsFromPoint(clientX, clientY);
    return elements
      .map((element) =>
        element.closest<HTMLElement>(
          `[data-settings-dnd-group="${dragGroupId}"][data-settings-dnd-item]`,
        ),
      )
      .find((element): element is HTMLElement => element !== null);
  }, [dragGroupId]);

  const handlePointerDown = useCallback((
    event: PointerEvent<HTMLButtonElement>,
    itemId: string,
    itemElement: HTMLDivElement | null,
  ) => {
    if (event.button !== 0 || !itemElement) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = itemElement.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    setDraggedItemId(itemId);
    setDragOverItemId(itemId);
    setDragPreview({
      itemId,
      left: rect.left,
      offsetY,
      top: event.clientY - offsetY,
      width: rect.width,
    });
  }, []);

  const handlePointerMove = useCallback((
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    if (!draggedItemId) {
      return;
    }

    event.preventDefault();
    setDragPreview((preview) =>
      preview ? { ...preview, top: event.clientY - preview.offsetY } : preview
    );

    const target = findTarget(event.clientX, event.clientY);
    const targetId = target?.dataset.settingsDndItem;
    if (!target || !targetId) {
      setDragOverItemId(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setDragOverItemId(targetId);
    setDropPosition(
      event.clientY > rect.top + rect.height / 2 ? "after" : "before",
    );
  }, [draggedItemId, findTarget]);

  const handlePointerUp = useCallback((
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (
      draggedItemId &&
      dragOverItemId &&
      draggedItemId !== dragOverItemId
    ) {
      onReorderItem(draggedItemId, dragOverItemId, dropPosition);
    }
    clearDragState();
  }, [
    clearDragState,
    draggedItemId,
    dragOverItemId,
    dropPosition,
    onReorderItem,
  ]);

  return {
    clearDragState,
    dragGroupId,
    dragPreview,
    draggedItemId,
    dragOverItemId,
    dropPosition,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
