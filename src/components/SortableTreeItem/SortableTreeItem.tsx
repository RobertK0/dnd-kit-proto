import React, { CSSProperties } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { iOS } from "../utilities/utilities";
import { TreeItem, TreeItemProps } from "../TreeItem/TreeItem";
import { useAtom } from "jotai";
import { itemBeingEdited } from "../../store/items";

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
  containerId: string;
  label: string;
  canHaveChildren: boolean;
  selected: boolean;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function SortableTreeItem({
  id,
  depth,
  selected,
  label,
  type,
  canHaveChildren,
  containerId,
  ...props
}: Props) {
  const [editedId, setEditedId] = useAtom(itemBeingEdited);

  const hookParams = {
    id,
    data: {
      container: containerId,
      item: {
        id,
        label,
        type,
        canHaveChildren,
      } as {
        id: UniqueIdentifier;
        label: string;
        type: string;
        canHaveChildren: boolean;
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
    transition: `${transition}, background 0.2s ease, color 0.2s ease`,
    minWidth: 600,
    cursor: "pointer",

    background: selected ? "#AE1065" : "#f3f3f3",
    color: selected ? "white" : "#1c1c1c",
  };

  return (
    <TreeItem
      onClick={() => {
        setEditedId(id);
        console.log("asdasd", id);
      }}
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      label={label}
      style={style}
      depth={depth}
      dragging={isDragging}
      type={type}
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
