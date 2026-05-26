import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import logoDark from "../assets/BLDLabLogoDark.png";
import logoLight from "../assets/BLDLabLogoLight.png";

const linkClass = ({ isActive }) =>
  "nav-bar__link" + (isActive ? " nav-bar__link--active" : "");

const PARITY_CLOSE_MS = 220;

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

export function NavBar() {
  const [showParityDropdown, setShowParityDropdown] = useState(false);
  const parityCloseTimer = useRef(null);

  const clearParityCloseTimer = () => {
    if (parityCloseTimer.current != null) {
      clearTimeout(parityCloseTimer.current);
      parityCloseTimer.current = null;
    }
  };

  const openParityMenu = () => {
    clearParityCloseTimer();
    setShowParityDropdown(true);
  };

  const scheduleParityClose = () => {
    clearParityCloseTimer();
    parityCloseTimer.current = setTimeout(() => {
      setShowParityDropdown(false);
      parityCloseTimer.current = null;
    }, PARITY_CLOSE_MS);
  };

  useEffect(() => () => clearParityCloseTimer(), []);

  const dark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

  return (
    <header className="nav-bar">
      <div className="nav-bar__inner">
        <NavLink to="/" className="nav-bar__brand" end>
        <img
            src={dark ? logoDark : logoLight}
            alt="BLDLab"
            height="80px"
            width="auto"
        />
        </NavLink>

        <nav className="nav-bar__nav" aria-label="Primary">
          <ul className="nav-bar__list">
            <li>
              <NavLink to="/home" className={linkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/import" className={linkClass}>
                Import
              </NavLink>
            </li>
            <li>
              <NavLink to="/edges" className={linkClass}>
                Edges
              </NavLink>
            </li>
            <li>
              <NavLink to="/corners" className={linkClass}>
                Corners
              </NavLink>
            </li>
            <li
              className={
                "nav-bar__parity" +
                (showParityDropdown ? " nav-bar__parity--open" : "")
              }
              onMouseEnter={openParityMenu}
              onMouseLeave={scheduleParityClose}
            >
              <button
                type="button"
                className="nav-bar__parity-trigger"
                aria-expanded={showParityDropdown}
                aria-haspopup="true"
                onClick={() => setShowParityDropdown((v) => !v)}
              >
                Parity
                <span className="nav-bar__chevron" aria-hidden>
                  ▾
                </span>
              </button>
              {showParityDropdown && (
                <ul className="nav-bar__dropdown" role="menu">
                  <li role="none">
                    <NavLink
                      to="/2E2C"
                      className={linkClass}
                      role="menuitem"
                      onClick={() => setShowParityDropdown(false)}
                    >
                      2E2C
                    </NavLink>
                  </li>
                  <li role="none">
                    <NavLink
                      to="/LTCT"
                      className={linkClass}
                      role="menuitem"
                      onClick={() => setShowParityDropdown(false)}
                    >
                      LTCT/T2C
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <ThemeToggle className="nav-bar__theme" />
      </div>
    </header>
  );
}
