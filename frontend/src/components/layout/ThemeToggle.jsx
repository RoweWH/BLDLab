import { useCallback, useSyncExternalStore } from "react";

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function subscribe(callback) {
  const obs = new MutationObserver(() => callback());
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => obs.disconnect();
}

export function ThemeToggle({ className = "" }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("bldlab-theme", next);
  }, []);

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <span className="theme-toggle__track" aria-hidden />
      <span className="theme-toggle__icons" aria-hidden>
        <span className="theme-toggle__sun">☀</span>
        <span className="theme-toggle__moon">☽</span>
      </span>
    </button>
  );
}
