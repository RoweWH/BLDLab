import logoDark from "../assets/BLDLabLogoDark.png";
import logoLight from "../assets/BLDLabLogoLight.png";
import { ThemeToggle } from "../components/ThemeToggle";
import { NavLink } from "react-router-dom";
import { useSyncExternalStore } from "react";

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function subscribeToTheme(callback) {
  const obs = new MutationObserver(callback);

  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => obs.disconnect();
}

export function Landing() {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false
  );

  return (
    <div className="page">
      <ThemeToggle className="nav-bar__theme" />

      <h1>
        <img
          src={dark ? logoDark : logoLight}
          alt="BLDLab"
          style={{ height: "120px", width: "auto" }}
        />
      </h1>

      <NavLink to="/home" className="nav-bar__link">
        Enter
      </NavLink>
    </div>
  );
}