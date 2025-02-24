import type { MutableRefObject } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  type: string;
  label: string;
  canHaveChildren: boolean;
  isConstructor: boolean;
  depthLabel: string;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  type: string;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
