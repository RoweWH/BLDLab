function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, excluded = []) {
  const normalizedPiece = normalizePiece(piece);

  return excluded
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function BufferColumn({ column, excluded = [] }) {
  const rows = column.rows.filter(
    (cell) => !isExcluded(cell.row.piece, excluded),
  );

  return (
    <div className="buffer-column">
      <div className="buffer-column__header">
        {column.column.piece} ({column.column.letter})
      </div>

      {rows.map((cell) => (
        <div className="buffer-column__cell" key={cell.row.piece}>
          {cell.row.piece} ({cell.row.letter})
        </div>
      ))}
    </div>
  );
}
