import { useEffect, useState } from "react";
import { Cell } from "./Cell";

const DEFAULT_WIDTH = 360;
const MIN_WIDTH = 200;

export function Column({
  column,
  type,
  letterScheme,
  isSelected,
  onHeaderClick,
  onCellClick
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    if (!isSelected) {
      setWidth(DEFAULT_WIDTH);
    }
  }, [isSelected]);

  function getMaxWidth() {
    return Math.max(MIN_WIDTH, window.innerWidth - 260);
  }

  function handleResizeStart(e) {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = width;
    const maxWidth = getMaxWidth();

    function resize(e) {
      const newWidth = startWidth + e.clientX - startX;
      const clampedWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, newWidth));

      setWidth(clampedWidth);
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
        "--selected-column-width": `${width}px`,
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
        {letterScheme?.[column.piece] ? ` (${letterScheme[column.piece]})` : ""}
      </button>

      {column.rows.map((row, index) => (
        <Cell
          key={`${column.piece}-${row.piece}-${index}`}
          cell={row}
          type={type}
          onClick={() => onCellClick(row)}
        />
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
