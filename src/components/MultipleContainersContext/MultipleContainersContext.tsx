import {
  closestCenter,
  CollisionDetection,
  DndContext,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { type PropsWithChildren } from "react";

import { coordinateGetter } from "../utilities/utilities";

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
export type Item = {
  id: UniqueIdentifier;
  label: string;
};

export const TRASH_ID = "void";

/**
 * Custom collision detection strategy optimized for multiple containers
 *
 * - First, find any droppable containers intersecting with the pointer.
 * - If there are none, find intersecting containers with the active draggable.
 * - If there are no intersecting containers, return the last matched intersection
 *
 */

export const destinationDollisionDetectionStrategy: CollisionDetection =
  (args) => {
    const items = args.droppableContainers
      .filter(
        (container) => container.data.current?.container === "B"
      )
      .map(
        (container) =>
          container.data.current?.item.id as UniqueIdentifier
      );

    if (args.active.id && items.includes(args.active.id)) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => items.includes(container.id)
        ),
      });
    }

    // Start by finding any intersecting droppable
    const pointerIntersections = pointerWithin(args);
    const intersections =
      pointerIntersections.length > 0
        ? // If there are droppables intersecting with the pointer, return those
          pointerIntersections
        : rectIntersection(args);
    let overId = getFirstCollision(intersections, "id");

    if (overId != null && items.includes(overId)) {
      // If a container is matched, and it contains items (columns 'A', 'B', 'C')
      if (items.length > 0) {
        // Return the closest droppable within that container
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              container.id !== overId &&
              items.includes(container.id)
          ),
        })[0]?.id;
      }

      return [{ id: overId }];
    }

    return [];
  };

const collisionDetectionStrategy: CollisionDetection = (args) => {
  return [...destinationDollisionDetectionStrategy(args)];
};

export function MultipleContainersContext({
  children,
}: PropsWithChildren<{}>) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      {children}
    </DndContext>
  );
}
