import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CommandBar } from "@/pages/DocumentPage/CommandBar";
import type { CommandBarProps } from "@/pages/DocumentPage/CommandBar";

const commandBarHeight = 36;

function findScrollParent(element: HTMLElement) {
  let currentElement: HTMLElement | null = element.parentElement;

  while (currentElement) {
    const style = window.getComputedStyle(currentElement);

    if (/(auto|scroll|overlay)/.test(style.overflowY)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return document.documentElement;
}

export function CommandBarDock(props: CommandBarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [dockStyle, setDockStyle] = useState<CSSProperties>({
    inset: 0,
    position: "absolute",
  });

  const updateDockPosition = useCallback(() => {
    const placeholderElement = placeholderRef.current;

    if (!placeholderElement) {
      return;
    }

    const scrollParent = findScrollParent(placeholderElement);
    const placeholderRect = placeholderElement.getBoundingClientRect();
    const scrollParentRect = scrollParent.getBoundingClientRect();
    const top = Math.min(
      Math.max(placeholderRect.top, scrollParentRect.top),
      scrollParentRect.bottom - commandBarHeight,
    );

    setDockStyle({
      left: placeholderRect.left,
      position: "fixed",
      top,
      width: placeholderRect.width,
      zIndex: 20,
    });
  }, []);

  useEffect(() => {
    const placeholderElement = placeholderRef.current;

    if (!placeholderElement) {
      return;
    }

    const scrollParent = findScrollParent(placeholderElement);
    const observer = new ResizeObserver(updateDockPosition);
    const updateAfterLayout = () => window.requestAnimationFrame(updateDockPosition);

    updateAfterLayout();
    scrollParent.addEventListener("scroll", updateAfterLayout, { passive: true });
    window.addEventListener("resize", updateAfterLayout);
    observer.observe(placeholderElement);
    observer.observe(scrollParent);

    return () => {
      scrollParent.removeEventListener("scroll", updateAfterLayout);
      window.removeEventListener("resize", updateAfterLayout);
      observer.disconnect();
    };
  }, [updateDockPosition]);

  return (
    <div className="relative h-[36px]" ref={placeholderRef}>
      <div style={dockStyle}>
        <CommandBar {...props} />
      </div>
    </div>
  );
}
