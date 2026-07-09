import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function initDisplaySettings() {
  const root = document.documentElement;

  const storedTheme = localStorage.getItem("bldlab-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    root.dataset.theme = storedTheme;
  } else {
    root.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
  }

  const storedColorTheme = localStorage.getItem("bldlab-color-theme");
  root.dataset.colorTheme = storedColorTheme || "orange";
}

initDisplaySettings();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);