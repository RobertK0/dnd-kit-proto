import styled from "styled-components";
import { Editor } from "./components/Editor/Editor";
import { MultipleContainersContext } from "./components/MultipleContainersContext/MultipleContainersContext";
import { SortableTree } from "./components/SortableTree/SortableTree";
import { Taskbar } from "./components/Taskbar/Taskbar";
import { Vendor } from "./components/Vendor/Vendor";
import { useState } from "react";

const AppContainer = styled.div`
  display: flex;
  flex: 1;
`;

function App() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState<boolean>(false);

  return (
    <>
      <AppContainer>
        <Taskbar setIsSidebarOpen={setIsSidebarOpen} />
        <div style={{ margin: "100px", display: "flex", gap: 24 }}>
          <MultipleContainersContext>
            <Vendor isOpen={isSidebarOpen} />
            <div>
              <SortableTree
                setIsSidebarOpen={setIsSidebarOpen}
                indicator
                removable
              />
            </div>
          </MultipleContainersContext>
          <div>
            <Editor />
          </div>
        </div>
      </AppContainer>
    </>
  );
}

export default App;
