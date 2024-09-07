import { MultipleContainersContext } from "./components/MultipleContainersContext/MultipleContainersContext";
import { MultipleContainersOverlay } from "./components/MultipleContainersOverlay/MultipleContainersOverlay";
import { SortableTree } from "./components/SortableTree/SortableTree";
import { Vendor } from "./components/Vendor/Vendor";

function App() {
  return (
    <>
      <div style={{ display: "flex" }}>
        <MultipleContainersContext>
          <div>
            <Vendor />
          </div>
          <div>
            <SortableTree indicator removable />
          </div>
          <MultipleContainersOverlay />
        </MultipleContainersContext>
      </div>
    </>
  );
}

export default App;
