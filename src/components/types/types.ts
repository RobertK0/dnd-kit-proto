import type { MutableRefObject } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  label: string;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  label: string;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
