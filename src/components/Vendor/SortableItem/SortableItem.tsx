import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";

import { Item } from "../../Item/Item";

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  label: string;
  type: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  canHaveChildren: boolean;
  isConstructor: boolean;
}

export function SortableItem({
  disabled,
  id,
  label,
  type,
  index,
  handle,
  containerId,
  canHaveChildren,
  isConstructor,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      container: containerId,
      item: {
        id,
        label,
        type,
        canHaveChildren,
        isConstructor,
      } as {
        id: UniqueIdentifier;
        label: string;
        type: string;
        isConstructor: boolean;
        canHaveChildren: boolean;
      },
    },
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      style={{
        backgroundColor: "#FDF0F7",
        borderRadius: 2,
        border: "none",
        boxShadow: "none",
        color: "#AE1065",
        padding: "10px 15px",
      }}
      ref={disabled ? undefined : setNodeRef}
      value={label}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle ? { ref: setActivatorNodeRef } : undefined
      }
      index={index}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
