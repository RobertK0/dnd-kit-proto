import { useState } from "react";

import {
  type DragOverEvent,
  type UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { Item } from "../Item/Item";
import { createRange } from "../utilities/utilities";
import { Container } from "../Container/Container";
import {
  getColor,
  SortableItem,
} from "./SortableItem/SortableItem";

const BUILDING_BLOCKS = [
  "Page",
  "Section",
  "Field group",
  "Single choice",
  "Multiple choice",
];

export const SOURCE_ITEMS = createRange<{
  id: UniqueIdentifier;
  label: string;
}>(BUILDING_BLOCKS.length, (index: number) => ({
  id: `A${index + 1}`,
  label: `${BUILDING_BLOCKS[index]}`,
}));

export function Vendor() {
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
    <Container label="Source">
      {SOURCE_ITEMS.map((value, index) => {
        if (isDropping === value.id) {
          return (
            <Item
              key={value.id}
              value={value.label}
              dragging={true}
              sorting={false}
              index={index}
              color={getColor(value.id)}
            />
          );
        }

        return (
          <SortableItem
            key={value.id}
            id={value.id}
            label={value.label}
            index={index}
            handle={false}
            containerId={"A"}
          />
        );
      })}
    </Container>
  );
}
