import { createPortal } from "react-dom";
import {
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";

import { Item } from "../Item/Item";
import { getColor } from "../Vendor/SortableItem/SortableItem";
import { CSS } from "@dnd-kit/utilities";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      {
        opacity: 1,
        transform: CSS.Transform.toString(transform.initial),
      },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
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
        event.active.data.current.container === "B";
    },
    onDragCancel() {
      setActiveItem(null);
    },
    onDragEnd() {
      setActiveItem(null);
    },
  });

  useEffect(() => {
    console.log("active item in overlay", activeItem);
  }, [activeItem]);

  return createPortal(
    <DragOverlay
      adjustScale={false}
      dropAnimation={useAnimation.current ? dropAnimation : null}
    >
      {activeItem ? (
        <Item
          value={activeItem.label}
          handle={false}
          color={"#ffff00"}
          dragOverlay
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}
