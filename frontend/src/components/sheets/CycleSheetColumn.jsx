import { CycleSheetCell } from "./CycleSheetCell";

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
}) {
  const rows = column.rows.filter(
    (cell) => !isExcluded(cell.row.piece, exclude),
  );

  return (
    <div
      className={
        isSelected
          ? "cycle-sheet-column cycle-sheet-column--selected"
          : "cycle-sheet-column"
      }
    >
      <button
        type="button"
        className="cycle-sheet-column__header"
        onClick={() => onHeaderClick(column.column.piece)}
      >
        {column.column.piece} ({column.column.letter})
      </button>

      {rows.map((cell) => (
        <CycleSheetCell key={cell.row.piece} cell={cell} type={type} />
      ))}
    </div>
  );
}
