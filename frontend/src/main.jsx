import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function initDisplaySettings() {
  const root = document.documentElement;

  const storedTheme = localStorage.getItem("bldlab-theme");
  root.dataset.theme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";

  const storedColorTheme = localStorage.getItem("bldlab-color-theme");
  root.dataset.colorTheme = storedColorTheme || "blue";
}

initDisplaySettings();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
