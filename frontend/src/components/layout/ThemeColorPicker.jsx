import { useCallback, useSyncExternalStore } from "react";
import "./ThemeColorPicker.css";

const COLOR_THEMES = [
  { id: "orange", label: "Orange" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "purple", label: "Purple" },
  { id: "red", label: "Red" },
  { id: "grey", label: "Grey" },
  { id: "pink", label: "Pink" },
  { id: "cream", label: "Cream" },
  { id: "light-blue", label: "Light Blue" },
  { id: "light-purple", label: "Light Purple" },
  { id: "light-green", label: "Light Green" },
];

function getSnapshot() {
  return document.documentElement.dataset.colorTheme || "orange";
}

function subscribe(callback) {
  const obs = new MutationObserver(() => callback());

  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-theme"],
  });

  return () => obs.disconnect();
}

export function ThemeColorPicker() {
  const selectedTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "orange",
  );

  const selectTheme = useCallback((themeId) => {
    document.documentElement.dataset.colorTheme = themeId;
    localStorage.setItem("bldlab-color-theme", themeId);
  }, []);

  return (
    <div className="theme-color-picker">
      <span className="theme-color-picker__label">Theme Color</span>

      <div className="theme-color-picker__options">
        {COLOR_THEMES.map((theme) => {
          const selected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-color-picker__button theme-color-picker__button--${theme.id}`}
              aria-label={`Use ${theme.label} theme`}
              aria-pressed={selected}
              title={theme.label}
              onClick={() => selectTheme(theme.id)}
            >
              <span className="theme-color-picker__swatch" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}