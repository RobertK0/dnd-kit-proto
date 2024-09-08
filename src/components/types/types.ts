import type { MutableRefObject } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  type: string;
  label: string;
  canHaveChildren: boolean;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  type: string;
  label: string;
  canHaveChildren: boolean;
  isConstructor: boolean;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
