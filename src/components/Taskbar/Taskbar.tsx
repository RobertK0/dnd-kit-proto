import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";

const StyledTaskbar = styled.div`
  background-color: #fdf0f7;
  padding: 30px 15px;
  z-index: 11;
`;

const AddBlockButton = styled.button`
  background-color: #ae1065;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d54593;
  }
`;

export const Taskbar = ({
  setIsSidebarOpen,
}: {
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleOpenSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <StyledTaskbar>
      <AddBlockButton onClick={handleOpenSidebar}>
        {PlusIcon}
      </AddBlockButton>
    </StyledTaskbar>
  );
};

const PlusIcon = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.00148 10V0H5.99112V10H4.00148ZM0 5.99112V4.00148H10V5.99112H0Z"
      fill="white"
    />
  </svg>
);
