import { useState } from "react";

import {
  type DragOverEvent,
  type UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { Item } from "../Item/Item";
import { createRange } from "../utilities/utilities";
import { Container } from "../Container/Container";
import { SortableItem } from "./SortableItem/SortableItem";
import { nanoid } from "nanoid";

export const SOURCE_ITEMS = [
  {
    id: nanoid(6),
    label: "Page",
    type: "Page",
    canHaveChildren: true,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Section",
    type: "Section",
    canHaveChildren: true,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Field Group",
    type: "Field Group",
    canHaveChildren: true,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Related Field Group",
    type: "Related Field Group",
    canHaveChildren: true,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Text Input",
    type: "Text Input",
    canHaveChildren: false,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Text Block",
    type: "Text Block",
    canHaveChildren: false,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Country",
    type: "Country",
    canHaveChildren: false,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Single Choice",
    type: "Single Choice",
    canHaveChildren: false,
    isConstructor: true,
  },
  {
    id: nanoid(6),
    label: "Multiple Choice",
    type: "Multiple Choice",
    canHaveChildren: false,
    isConstructor: true,
  },
];

export function Vendor({ isOpen }: { isOpen: boolean }) {
  const [isDropping, setIsDropping] =
    useState<UniqueIdentifier | null>(null);

  useDndMonitor({
    onDragOver(event: DragOverEvent) {
      setIsDropping(
        event.over?.data.current?.container === "B"
          ? event.active.id
          : null
      );
    },
    onDragCancel() {
      setIsDropping(null);
    },
    onDragEnd() {
      setIsDropping(null);
    },
  });

  return (
    <Container
      style={{
        position: "fixed",
        zIndex: 10,
        left: 70,
        top: 0,
        bottom: 0,
        margin: 0,
        backgroundColor: "#fff",
        transition: "transform 0.3s ease",
        transform: isOpen ? "none" : "translateX(-125%)",
      }}
    >
      {SOURCE_ITEMS.map((value, index) => {
        if (isDropping === value.id) {
          return (
            <Item
              key={value.id}
              value={value.label}
              dragging={true}
              sorting={false}
              index={index}
            />
          );
        }

        return (
          <SortableItem
            canHaveChildren={value.canHaveChildren}
            isConstructor={value.isConstructor}
            key={value.id}
            id={value.id}
            label={value.label}
            type={value.type}
            index={index}
            handle={false}
            containerId={"A"}
          />
        );
      })}
    </Container>
  );
}
