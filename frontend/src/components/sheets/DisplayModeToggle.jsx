import "./DisplayModeToggle.css";

export function DisplayModeToggle({ value, onChange }) {
  return (
    <div className="display-mode-toggle">
      <button
        type="button"
        className={`display-mode-toggle__option ${
          value === "algorithms" ? "display-mode-toggle__option--active" : ""
        }`}
        onClick={() => onChange("algorithms")}
      >
        Algorithms
      </button>

      <button
        type="button"
        className={`display-mode-toggle__option ${
          value === "words" ? "display-mode-toggle__option--active" : ""
        }`}
        onClick={() => onChange("words")}
      >
        Words
      </button>
    </div>
  );
}
