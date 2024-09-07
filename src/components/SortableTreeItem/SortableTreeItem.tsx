import React, { CSSProperties } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { iOS } from "../utilities/utilities";
import { TreeItem, TreeItemProps } from "../TreeItem/TreeItem";

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
  containerId: string;
  label: string;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function SortableTreeItem({
  id,
  depth,
  label,
  containerId,
  ...props
}: Props) {
  const hookParams = {
    id,
    data: {
      container: containerId,
      item: {
        id,
        label,
      } as {
        id: UniqueIdentifier;
        label: string;
      },
    },
    animateLayoutChanges,
  };

  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable(hookParams);

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    minWidth: 600,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      label={label}
      style={style}
      depth={depth}
      dragging={isDragging}
      ghost={isDragging}
      // ghost={false}
      disableSelection={iOS}
      transform={transform}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
