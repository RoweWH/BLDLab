const DEFAULT_THEME = "dark";
const DEFAULT_COLOR_THEME = "blue";

export function applyInitialTheme() {
  const savedTheme = localStorage.getItem("bldlab-theme");
  const savedColorTheme = localStorage.getItem("bldlab-color-theme");

  document.documentElement.dataset.theme = savedTheme || DEFAULT_THEME;
  document.documentElement.dataset.colorTheme =
    savedColorTheme || DEFAULT_COLOR_THEME;
}