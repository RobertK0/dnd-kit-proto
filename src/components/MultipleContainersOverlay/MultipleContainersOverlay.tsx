import { createPortal } from "react-dom";
import {
  defaultDropAnimationSideEffects,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { useState } from "react";

import { Item } from "../Item/Item";
import { getColor } from "../Vendor/SortableItem/SortableItem";

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

  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      setActiveItem(
        (event.active.data.current?.item ?? null) as {
          id: UniqueIdentifier;
          label: string;
        } | null
      );
    },
    onDragCancel() {
      setActiveItem(null);
    },
    onDragEnd() {
      setActiveItem(null);
    },
  });

  return createPortal(
    <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
      {activeItem ? (
        <Item
          value={activeItem.label}
          handle={false}
          color={getColor(activeItem.id)}
          dragOverlay
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}
