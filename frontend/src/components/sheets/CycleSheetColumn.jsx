import { CycleSheetCell } from "./CycleSheetCell";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, excluded = []) {
  const normalizedPiece = normalizePiece(piece);

  return excluded
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function CycleSheetColumn({ column, type, excluded = [] }) {
  const rows = column.rows.filter(
    (cell) => !isExcluded(cell.row.piece, excluded),
  );

  return (
    <div className="cycle-sheet-column">
      <div className="cycle-sheet-column__header">
        {column.column.piece} ({column.column.letter})
      </div>

      {rows.map((cell) => (
        <CycleSheetCell key={cell.row.piece} cell={cell} type={type} />
      ))}
    </div>
  );
}
