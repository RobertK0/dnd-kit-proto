import { useAtom } from "jotai";
import { itemBeingEdited, itemsData } from "../../store/items";
import { buildTree, flattenTree } from "../utilities/utilities";
import { ChangeEvent, useMemo } from "react";
import { cloneDeep } from "lodash";
import styled from "styled-components";

const StyledEditor = styled.div`
  height: 100%;
  padding: 24px;
  background-color: #f3f3f3;
  width: 400px;
`;

const StyledInput = styled.input`
  border: none;
  background-color: transparent;
  font-weight: 600;
  font-size: 24px;
  font-family: inherit;
  display: inline-block;
`;

const StyledTypeBadge = styled.span`
  background-color: #ae1065;
  color: #fff;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 2px;
  font-weight: 600;
  height: fit-content;
`;

export const Editor = () => {
  const [items, setItems] = useAtom(itemsData);
  const [editedId, setEditedId] = useAtom(itemBeingEdited);

  const flattenedItems = useMemo(() => {
    return flattenTree(items);
  }, [items]);

  const editedItem = useMemo(() => {
    return flattenedItems.find((item) => item.id === editedId);
  }, [editedId, flattenedItems]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItems((prev) => {
      const editedItemIndex = flattenedItems.findIndex(
        (item) => item.id === editedId
      );

      const newItems = cloneDeep(flattenedItems!);
      newItems[editedItemIndex].label = e.currentTarget.value;

      return buildTree(newItems);
    });
  };

  return (
    <StyledEditor>
      {editedId && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <StyledInput
            size={editedItem?.label.length}
            type="text"
            onChange={handleNameChange}
            value={editedItem?.label}
          />
          <StyledTypeBadge>{editedItem?.type}</StyledTypeBadge>
        </div>
      )}
    </StyledEditor>
  );
};
