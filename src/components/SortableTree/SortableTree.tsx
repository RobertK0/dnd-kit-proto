import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Announcements,
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  Modifier,
  defaultDropAnimation,
  UniqueIdentifier,
  useDndMonitor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import {
  buildTree,
  createRange,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
  sortableTreeKeyboardCoordinates,
} from "../utilities/utilities";

import {
  FlattenedItem,
  SensorContext,
  TreeItems,
} from "../types/types";
import { SortableTreeItem } from "../SortableTreeItem/SortableTreeItem";
import { SOURCE_ITEMS } from "../Vendor/Vendor";
import { Item } from "../MultipleContainersContext/MultipleContainersContext";
import { SortableItem } from "../Vendor/SortableItem/SortableItem";

let nextId = 5;

const initialItems: TreeItems = [
  {
    id: "Home",
    label: "Home",
    children: [],
  },
  {
    id: "Collections",
    label: "Collections",
    children: [
      {
        id: "Spring",
        label: "Spring",
        children: [],
      },
      {
        id: "Summer",
        label: "Summer",
        children: [],
      },
      {
        id: "Fall",
        label: "Fall",
        children: [],
      },
      {
        id: "Winter",
        label: "Winter",
        children: [],
      },
    ],
  },
  {
    id: "About Us",
    label: "About Us",
    children: [],
  },
  {
    id: "My Account",
    label: "My Account",
    children: [
      {
        id: "Addresses",
        label: "Addresses",
        children: [],
      },
      {
        id: "Order History",
        label: "Order History",
        children: [],
      },
    ],
  },
];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
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

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator = false,
  indentationWidth = 50,
  removable,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(
    null
  );
  const [overId, setOverId] = useState<UniqueIdentifier | null>(
    null
  );
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  console.log(items);
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(
      sensorContext,
      indicator,
      indentationWidth
    )
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement(
        "onDragMove",
        active.id,
        over?.id
      );
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement(
        "onDragOver",
        active.id,
        over?.id
      );
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement(
        "onDragEnd",
        active.id,
        over?.id
      );
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  //START

  const [clonedItems, setClonedItems] = useState<Item[] | null>(
    null
  );
  const [destinationItems, setDestinationItems] = useState<Item[]>(
    createRange<Item>(3, (index) => ({
      id: `B${index + 1}`,
      label: `B${index + 1}`,
    }))
  );

  useDndMonitor({
    onDragStart() {
      setClonedItems(destinationItems);
      console.log("dndmonitor ondragstart");
      document.body.style.setProperty("cursor", "grabbing");
    },
    onDragMove() {
      console.log("dndmonitor ondragmove");
    },
    onDragOver({ active, over }) {
      console.log("dndmonitor ondragover");
      const overId = over?.id;

      const overContainer = over?.data.current?.container as
        | string
        | undefined;
      const activeContainer = active.data.current?.container as
        | string
        | undefined;

      if (
        overId == null ||
        destinationItems.find(({ id }) => id === active.id)
      ) {
        return;
      }

      if (!overContainer || !activeContainer) {
        return;
      }

      // We are moving to a new container and must move the object so that
      // it is rendered in that container's list
      // console.log(
      //   "We are moving to a new container and must move the object so that it is rendered in that container's list",
      //   active,
      //   over
      // );
      if (activeContainer !== overContainer) {
        setActiveId(active.id);
        setOverId(over.id);
        // setDestinationItems((items) => {
        setItems((items) => {
          // TODO here, find proper index instead of inserting at end
          console.log("test2323", flattenedItems);

          const overIndex = items.findIndex(
            ({ id }) => id === overId
          );
          const activeIndex = SOURCE_ITEMS.findIndex(
            ({ id }) => id === active.id
          );

          return [
            ...items,
            {
              id: active.id,
              children: [],
              collapsed: false,
              label: active.data.current.item.label,
            },
          ];
          console.log(items);

          let newIndex: number;

          if (overId in items) {
            newIndex = items.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex =
              overIndex >= 0
                ? overIndex + modifier
                : items.length + 1;
          }

          return [
            ...items.slice(0, newIndex),
            SOURCE_ITEMS[activeIndex],
            ...items.slice(newIndex, items.length),
          ];
        });
      }
    },
    onDragEnd({ active, over }) {
      const activeContainer = active.data.current?.container as
        | string
        | undefined;

      if (!activeContainer) {
        return;
      }

      const overId = over?.id;

      if (overId == null) {
        return;
      }

      const overContainer = over?.data.current?.container as
        | string
        | undefined;

      if (overContainer === "A") {
        return;
      }

      if (overContainer) {
        setDestinationItems((items) => {
          const overIndex = items.findIndex(
            ({ id }) => id === overId
          );
          const activeIndex = items.findIndex(
            ({ id }) => id === active.id
          );

          let nextItems = items;

          if (activeIndex !== overIndex) {
            nextItems = arrayMove(items, activeIndex, overIndex);
          }

          if (SOURCE_ITEMS.find(({ id }) => id === active.id)) {
            const lastActiveIndex = nextItems.findIndex(
              ({ id }) => id === active.id
            );

            console.log("lastActiveIndex", lastActiveIndex);

            nextItems[lastActiveIndex] = {
              id: nextId,
              label: `${active.id} -> B${nextId++}`,
            };
          }

          return nextItems;
        });
      }
    },
    onDragCancel() {
      if (clonedItems) {
        // Reset items to their original state in case items have been
        // Dragged across containers
        setDestinationItems(clonedItems);
      }

      setClonedItems(null);
    },
  });

  //END

  useEffect(() => {
    console.log(flattenedItems);
    console.log(
      "test",
      flattenedItems.map(({ id }) => id)
    );
  }, [flattenedItems]);

  return (
    <DndContext
      accessibility={{ announcements }}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        // items={sortedIds}
        items={flattenedItems.map(({ id }) => id)}
        strategy={verticalListSortingStrategy}
      >
        {flattenedItems.map(
          ({ id, label, children, collapsed, depth }) => (
            <SortableTreeItem
              containerId="B"
              key={id}
              id={id}
              value={`${id}`}
              label={`${label}`}
              depth={
                id === activeId && projected
                  ? projected.depth
                  : depth
              }
              indentationWidth={indentationWidth}
              indicator={indicator}
              collapsed={Boolean(collapsed && children.length)}
              onCollapse={
                collapsible && children.length
                  ? () => handleCollapse(id)
                  : undefined
              }
              onRemove={
                removable ? () => handleRemove(id) : undefined
              }
            />
          )
        )}
        {/* {destinationItems.map((value, index) => (
        <SortableItem
          key={value.id}
          id={value.id}
          label={value.label}
          index={index}
          handle={false}
          containerId={"B"}
        />
      ))} */}
        {/* {flattenedItems.map(
        ({ id, label, children, collapsed, depth }, index) => (
          <>
            <SortableTreeItem
              containerId={"B"}
              label={label}
              key={id}
              id={id}
              value={id}
              // depth={
              //   id === activeId && projected
              //     ? projected.depth
              //     : depth
              // }
              depth={0}
              indentationWidth={indentationWidth}
              indicator={indicator}
              // collapsed={Boolean(collapsed && children.length)}
              collapsed={false}
              // onCollapse={
              //   collapsible && children.length
              //     ? () => handleCollapse(id)
              //     : undefined
              // }
              onCollapse={undefined}
              onRemove={
                removable ? () => handleRemove(id) : undefined
              }
            />
          </>
        )
      )} */}

        {/* {createPortal(
        <DragOverlay
          dropAnimation={dropAnimationConfig}
          modifiers={indicator ? [adjustTranslate] : undefined}
        >
          {activeId && activeItem ? (
            <SortableTreeItem
              id={activeId}
              depth={activeItem.depth}
              clone
              childCount={getChildCount(items, activeId) + 1}
              value={activeId.toString()}
              indentationWidth={indentationWidth}
            />
          ) : null}
        </DragOverlay>,
        document.body
      )} */}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({
    active: { id: activeId },
  }: DragStartEvent) {
    console.log("flattenedItems", flattenedItems);
    setActiveId(activeId);
    setOverId(activeId);
    const activeItem = flattenedItems.find(
      ({ id }) => id === activeId
    );
    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }
    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    console.log("handling drag move");
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    // setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    // resetState();
    // if (projected && over) {
    //   const { depth, parentId } = projected;
    //   const clonedItems: FlattenedItem[] = JSON.parse(
    //     JSON.stringify(flattenTree(items))
    //   );
    //   const overIndex = clonedItems.findIndex(
    //     ({ id }) => id === over.id
    //   );
    //   const activeIndex = clonedItems.findIndex(
    //     ({ id }) => id === active.id
    //   );
    //   const activeTreeItem = clonedItems[activeIndex];
    //   clonedItems[activeIndex] = {
    //     ...activeTreeItem,
    //     depth,
    //     parentId,
    //   };
    //   const sortedItems = arrayMove(
    //     clonedItems,
    //     activeIndex,
    //     overIndex
    //   );
    //   const newItems = buildTree(sortedItems);
    //   setItems(newItems);
    // }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id: UniqueIdentifier) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: UniqueIdentifier) {
    setItems((items) =>
      setProperty(items, id, "collapsed", (value) => {
        return !value;
      })
    );
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier
  ) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(
        ({ id }) => id === overId
      );
      const activeIndex = clonedItems.findIndex(
        ({ id }) => id === activeId
      );
      const sortedItems = arrayMove(
        clonedItems,
        activeIndex,
        overIndex
      );

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb =
        eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb =
        eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined =
            previousItem;
          while (
            previousSibling &&
            projected.depth < previousSibling.depth
          ) {
            const parentId: UniqueIdentifier | null =
              previousSibling.parentId;
            previousSibling = sortedItems.find(
              ({ id }) => id === parentId
            );
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
