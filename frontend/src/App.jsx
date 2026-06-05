import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Import } from "./pages/algs/Import";
import { Landing } from "./pages/auth/Landing";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Edges } from "./pages/algs/Edges";
import { Corners } from "./pages/algs/Corners";
import { TwoE2C } from "./pages/algs/TwoE2C";
import { LTCT } from "./pages/algs/LTCT";
import { SheetsHome } from "./pages/sheets/SheetsHome";
import { SheetView } from "./pages/sheets/SheetView";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sheets/:id" element={<SheetView />} />
          <Route path="/sheets" element={<SheetsHome />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/import" element={<Import />} />
            <Route path="/edges" element={<Edges />} />
            <Route path="/corners" element={<Corners />} />
            <Route path="/2E2C" element={<TwoE2C />} />
            <Route path="/LTCT" element={<LTCT />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
