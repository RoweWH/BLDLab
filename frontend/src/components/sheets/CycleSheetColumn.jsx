import { useEffect, useState } from "react";
import { CycleSheetCell } from "./CycleSheetCell";

const DEFAULT_WIDTH = 200;

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, exclude = []) {
  const normalizedPiece = normalizePiece(piece);

  return exclude
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function CycleSheetColumn({
  column,
  type,
  exclude = [],
  isSelected,
  onHeaderClick,
  hideHeader = false,
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    if (!isSelected) {
      setWidth(DEFAULT_WIDTH);
    }
  }, [isSelected]);

  const rows = column.rows.filter(
    (cell) => !isExcluded(cell.row.piece, exclude),
  );

  function handleResizeStart(e) {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = width;

    function handleMouseMove(e) {
      const nextWidth = startWidth + e.clientX - startX;
      setWidth(Math.max(DEFAULT_WIDTH, nextWidth));
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      className={
        isSelected
          ? "cycle-sheet-column cycle-sheet-column--selected"
          : "cycle-sheet-column"
      }
      style={
        isSelected
          ? {
              width: `${width}px`,
              minWidth: `${width}px`,
            }
          : undefined
      }
    >
      {!hideHeader && (
        <button
          type="button"
          className="cycle-sheet-column__header"
          onClick={() => onHeaderClick(column.column.piece)}
        >
          {column.column.piece} ({column.column.letter})
        </button>
      )}

      {rows.map((cell) => (
        <CycleSheetCell key={cell.row.piece} cell={cell} type={type} />
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
