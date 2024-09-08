import {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
} from "../utilities/utilities";

import { FlattenedItem } from "../types/types";
import { SortableTreeItem } from "../SortableTreeItem/SortableTreeItem";
import { nanoid } from "nanoid";
import { MultipleContainersOverlay } from "../MultipleContainersOverlay/MultipleContainersOverlay";
import { useAtom, useAtomValue } from "jotai";
import { itemBeingEdited, itemsData } from "../../store/items";

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
  const [items, setItems] = useAtom(itemsData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(
    null
  );
  const [overId, setOverId] = useState<UniqueIdentifier | null>(
    null
  );
  const [offsetLeft, setOffsetLeft] = useState(0);
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
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

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  // useEffect(() => {
  //   sensorContext.current = {
  //     items: flattenedItems,
  //     offset: offsetLeft,
  //   };
  // }, [flattenedItems, offsetLeft]);

  //START

  const dragStartPosition = useRef<number | null>(null);

  useDndMonitor({
    onDragStart(event) {
      // setClonedItems(destinationItems);
      setIsSidebarOpen(false);
      document.body.style.setProperty("cursor", "grabbing");
    },
    onDragMove({ active, delta }) {
      if (!active.data.current) return;
      if (!dragStartPosition.current) {
        dragStartPosition.current =
          active.data.current.container === "A" ? 79 : 0;
      }

      setOffsetLeft(delta.x - dragStartPosition.current);
    },
    onDragOver({ active, over }) {
      if (over === null || over.id === null) return;

      setOverId(over.id);
      setActiveId(active.id);

      const overContainer = over?.data.current?.container as
        | string
        | undefined;
      const activeContainer = active.data.current?.container as
        | string
        | undefined;

      if (!overContainer || !activeContainer) {
        return;
      }

      // We are moving to a new container and must move the object so that
      // it is rendered in that container's list

      if (activeContainer !== overContainer) {
        setItems((items) => {
          // TODO find index at which to insert
          //
          // const overIndex = items.findIndex(
          //   ({ id }) => id === overId
          // );
          // const activeIndex = SOURCE_ITEMS.findIndex(
          //   ({ id }) => id === active.id
          // );

          const {
            id,
            label,
            isConstructor,
            canHaveChildren,
            type,
          } = active.data.current?.item;

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

          // TODO find index at which to insert
          //
          // let newIndex: number;

          // if (over.id in items) {
          //   newIndex = items.length + 1;
          // } else {
          //   const isBelowOverItem =
          //     over &&
          //     active.rect.current.translated &&
          //     active.rect.current.translated.top >
          //       over.rect.top + over.rect.height;

          //   const modifier = isBelowOverItem ? 1 : 0;

          //   newIndex =
          //     overIndex >= 0
          //       ? overIndex + modifier
          //       : items.length + 1;
          // }

          // return [
          //   ...items.slice(0, newIndex),
          //   SOURCE_ITEMS[activeIndex],
          //   ...items.slice(newIndex, items.length),
          // ];
        });
      }
    },
    onDragEnd({ active, over }) {
      resetState();
      dragStartPosition.current = null;

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
      // if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      // setDestinationItems(clonedItems);
      // }
      // setClonedItems(null);
    },
  });

  //END

  const editedId = useAtomValue(itemBeingEdited);

  return (
    <SortableContext
      items={sortedIds}
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
      <MultipleContainersOverlay />
    </SortableContext>
  );

  //TODO implement drag cancel
  //
  // function handleDragCancel() {
  //   resetState();
  // }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
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
