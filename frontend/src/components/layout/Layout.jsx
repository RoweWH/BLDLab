import { NavBar } from "../ui/NavBar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <>
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
