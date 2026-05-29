import logoDark from "../assets/BLDLabLogoDark.png";
import logoLight from "../assets/BLDLabLogoLight.png";
import { ThemeToggle } from "../components/ThemeToggle";
import { useLocation } from "react-router-dom";
import { useSyncExternalStore, useState } from "react";
import { Login } from "../components/Login";
import { CreateAccount } from "../components/CreateAccount";

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
    () => false,
  );

  const location = useLocation();

  const [showCreateAccount, setShowCreateAccount] = useState(
    location.state?.mode === "signup",
  );

  return (
    <div className="page landing-page">
      <ThemeToggle className="nav-bar__theme" />

      <h1 className="landing-logo">
        <img src={dark ? logoDark : logoLight} alt="BLDLab" />
      </h1>

      <div className="auth-switch-container">
        <div className="auth-panel">
          {showCreateAccount ? (
            <>
              <CreateAccount />
              <button
                className="button-style auth-toggle-button"
                onClick={() => setShowCreateAccount(false)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <Login />
              <button
                className="button-style auth-toggle-button"
                onClick={() => setShowCreateAccount(true)}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
