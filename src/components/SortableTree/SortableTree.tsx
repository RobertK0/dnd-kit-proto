import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { nanoid } from "nanoid";
import { MultipleContainersOverlay } from "../MultipleContainersOverlay/MultipleContainersOverlay";
import { useAtom } from "jotai";
import { itemBeingEdited, itemsData } from "../../store/items";

let nextId = 5;

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
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export function SortableTree({
  collapsible,
  indicator = false,
  indentationWidth = 50,
  removable,
  setIsSidebarOpen,
}: Props) {
  // const [items, setItems] = useState(() => defaultItems);

  const [items, setItems] = useAtom(itemsData);
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
  // const sensorContext: SensorContext = useRef({
  //   items: flattenedItems,
  //   offset: offsetLeft,
  // });
  // const [coordinateGetter] = useState(() =>
  //   sortableTreeKeyboardCoordinates(
  //     sensorContext,
  //     indicator,
  //     indentationWidth
  //   )
  // );
  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  // useSensor(KeyboardSensor, {
  //   coordinateGetter,
  // })
  // );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  // useEffect(() => {
  //   sensorContext.current = {
  //     items: flattenedItems,
  //     offset: offsetLeft,
  //   };
  // }, [flattenedItems, offsetLeft]);

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

  const dragStartPosition = useRef(null);

  useDndMonitor({
    onDragStart(event) {
      setClonedItems(destinationItems);
      setIsSidebarOpen(false);
      console.log("dndmonitor ondragstart", event);
      document.body.style.setProperty("cursor", "grabbing");
    },
    onDragMove(event) {
      if (!dragStartPosition.current)
        dragStartPosition.current =
          event.active.data.current.container === "A" ? 79 : 0;

      setOffsetLeft(event.delta.x - dragStartPosition.current);
    },
    onDragOver({ active, over }) {
      console.log("dndmonitor ondragover");
      const overId = over?.id;
      setOverId(overId);
      setActiveId(active.id);
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
        // setDestinationItems((items) => {
        setItems((items) => {
          const overIndex = items.findIndex(
            ({ id }) => id === overId
          );
          const activeIndex = SOURCE_ITEMS.findIndex(
            ({ id }) => id === active.id
          );

          const {
            id,
            label,
            isConstructor,
            canHaveChildren,
            type,
          } = active.data.current.item;

          return [
            ...items,
            {
              id,
              children: [],
              collapsed: false,
              label,
              isConstructor,
              canHaveChildren,
              type,
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
      resetState();
      dragStartPosition.current = null;

      console.log("OVER EVENT", items);

      if (!projected || !over) return;

      const { depth, parentId } = projected;

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );

      //Index of item that the item being dropped is over
      const overIndex = clonedItems.findIndex(
        ({ id }) => id === over.id
      );

      //Index of item being dropped
      const activeIndex = clonedItems.findIndex(
        ({ id }) => id === active.id
      );

      //Item being dropped
      const activeTreeItem = clonedItems[activeIndex];
      console.log(
        "utilities,",
        activeTreeItem.isConstructor,
        activeTreeItem.id
      );
      const id = activeTreeItem.isConstructor
        ? nanoid(6)
        : activeTreeItem.id;

      clonedItems[activeIndex] = {
        ...activeTreeItem,
        depth,
        parentId,
        id,
      };

      const sortedItems = arrayMove(
        clonedItems,
        activeIndex,
        overIndex
      );

      const newItems = buildTree(sortedItems);

      setItems(newItems);

      // const activeContainer = active.data.current?.container as
      //   | string
      //   | undefined;

      // if (!activeContainer) {
      //   return;
      // }

      // const overId = over?.id;

      // if (overId == null) {
      //   return;
      // }

      // const overContainer = over?.data.current?.container as
      //   | string
      //   | undefined;

      // if (overContainer === "A") {
      //   return;
      // }

      // if (overContainer) {
      //   setDestinationItems((items) => {
      //     const overIndex = items.findIndex(
      //       ({ id }) => id === overId
      //     );
      //     const activeIndex = items.findIndex(
      //       ({ id }) => id === active.id
      //     );

      //     let nextItems = items;

      //     if (activeIndex !== overIndex) {
      //       nextItems = arrayMove(items, activeIndex, overIndex);
      //     }

      //     if (SOURCE_ITEMS.find(({ id }) => id === active.id)) {
      //       const lastActiveIndex = nextItems.findIndex(
      //         ({ id }) => id === active.id
      //       );

      //       console.log("lastActiveIndex", lastActiveIndex);

      //       nextItems[lastActiveIndex] = {
      //         id: nextId,
      //         label: `${active.id} -> B${nextId++}`,
      //       };
      //     }

      //     return nextItems;
      //   });
      // }
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

  const [editedId, setEditedId] = useAtom(itemBeingEdited);

  useEffect(() => {
    console.log("utilities", flattenedItems);
    console.log(
      "test",
      flattenedItems.map(({ id }) => id)
    );
  }, [flattenedItems]);

  return (
    // <DndContext
    //   accessibility={{ announcements }}
    //   sensors={sensors}
    //   collisionDetection={closestCenter}
    //   measuring={measuring}
    //   onDragStart={handleDragStart}
    //   onDragMove={handleDragMove}
    //   onDragOver={handleDragOver}
    //   onDragEnd={handleDragEnd}
    //   onDragCancel={handleDragCancel}
    // >
    <SortableContext
      // items={sortedIds}
      items={flattenedItems.map(({ id }) => id)}
      strategy={verticalListSortingStrategy}
    >
      {flattenedItems.map(
        ({
          id,
          label,
          type,
          children,
          collapsed,
          depth,
          canHaveChildren,
        }) => (
          <SortableTreeItem
            selected={editedId === id}
            containerId="B"
            key={id}
            id={id}
            value={`${id}`}
            label={`${label}`}
            type={type}
            depth={
              id === activeId && projected ? projected.depth : depth
            }
            canHaveChildren={canHaveChildren}
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
      <MultipleContainersOverlay />
    </SortableContext>
    // </DndContext>
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

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();
    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(
        ({ id }) => id === over.id
      );
      const activeIndex = clonedItems.findIndex(
        ({ id }) => id === active.id
      );
      const activeTreeItem = clonedItems[activeIndex];
      clonedItems[activeIndex] = {
        ...activeTreeItem,
        depth,
        parentId,
      };
      const sortedItems = arrayMove(
        clonedItems,
        activeIndex,
        overIndex
      );
      const newItems = buildTree(sortedItems);
      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);
    dragStartPosition.current = null;

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
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
