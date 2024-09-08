import { createPortal } from "react-dom";
import {
  defaultDropAnimationSideEffects,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  Modifier,
  UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { useRef, useState } from "react";

import { Item } from "../Item/Item";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export function MultipleContainersOverlay() {
  const [activeItem, setActiveItem] = useState<{
    id: UniqueIdentifier;
    label: string;
  } | null>(null);

  const useAnimation = useRef(false);

  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      setActiveItem(
        (event.active.data.current?.item ?? null) as {
          id: UniqueIdentifier;
          label: string;
        } | null
      );

      useAnimation.current =
        event.active.data.current?.container === "B";
    },
    onDragCancel() {
      setActiveItem(null);
    },
    onDragEnd() {
      setActiveItem(null);
    },
  });

  return createPortal(
    <DragOverlay
      adjustScale={false}
      dropAnimation={useAnimation.current ? dropAnimation : null}
      modifiers={[adjustTranslate]}
    >
      {activeItem ? (
        <Item value={activeItem.label} handle={false} dragOverlay />
      ) : null}
    </DragOverlay>,
    document.body
  );
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 30,
  };
};
