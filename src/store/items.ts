import { atom } from "jotai";
import { TreeItems } from "../components/types/types";
import { nanoid } from "nanoid";
import { UniqueIdentifier } from "@dnd-kit/core";

export const itemsData = atom<TreeItems>([
  {
    id: nanoid(6),
    type: "Page",
    label: "Page",
    canHaveChildren: true,
    isConstructor: false,
    children: [],
  },
  {
    id: nanoid(6),
    type: "Page",
    label: "Page",
    canHaveChildren: true,
    isConstructor: false,
    children: [
      {
        id: nanoid(6),
        type: "Section",
        label: "Section",
        canHaveChildren: true,
        isConstructor: false,
        children: [
          {
            id: nanoid(6),
            type: "Country",
            label: "Country",
            canHaveChildren: false,
            isConstructor: false,
            children: [],
          },
          {
            id: nanoid(6),
            type: "Text Block",
            label: "First name",
            canHaveChildren: false,
            isConstructor: false,
            children: [],
          },
          {
            id: nanoid(6),
            type: "Text Input",
            label: "Last name",
            canHaveChildren: false,
            isConstructor: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: nanoid(6),
    type: "Page",
    label: "Page",
    canHaveChildren: true,
    isConstructor: false,
    children: [
      {
        id: nanoid(6),
        type: "Single Choice",
        label: "Single Choice",
        canHaveChildren: false,
        isConstructor: false,
        children: [],
      },
      {
        id: nanoid(6),
        type: "Multiple Choice",
        label: "Multiple Choice",
        canHaveChildren: false,
        isConstructor: false,
        children: [],
      },
    ],
  },
]);

export const itemBeingEdited = atom<UniqueIdentifier | null>(null);
