import { useEffect, useState } from "react";
import { Cell } from "./Cell";

const DEFAULT_WIDTH = 200;

export function Column({ column, type, isSelected, onHeaderClick }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    if (!isSelected) {
      setWidth(DEFAULT_WIDTH);
    }
  }, [isSelected]);

  function handleResizeStart(e) {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = width;

    function resize(e) {
      const newWidth = startWidth + e.clientX - startX;
      setWidth(Math.max(DEFAULT_WIDTH, newWidth));
    }

    function stopResize() {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    }

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  const className = isSelected
    ? "cycle-sheet-column cycle-sheet-column--selected"
    : "cycle-sheet-column";

  const selectedStyle = isSelected
    ? {
        width: `${width}px`,
        minWidth: `${width}px`,
      }
    : undefined;

  return (
    <div className={className} style={selectedStyle}>
      <button
        type="button"
        className="cycle-sheet-column__header"
        onClick={() => onHeaderClick(column.piece)}
      >
        {column.piece}
      </button>

      {column.rows.map((row) => (
        <Cell key={row.piece} cell={row} type={type} />
      ))}

      {isSelected && (
        <div
          className="cycle-sheet-column__resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}
