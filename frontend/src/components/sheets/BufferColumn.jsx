function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, exclude = []) {
  const normalizedPiece = normalizePiece(piece);

  return exclude
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function BufferColumn({
  column,
  exclude = [],
  variant = "",
  hideHeader = false,
}) {
  const rows = column.rows.filter(
    (cell) => !isExcluded(cell.row.piece, exclude),
  );

  return (
    <div
      className={`buffer-column ${variant ? `buffer-column--${variant}` : ""}`}
    >
      {!hideHeader && (
        <div className="buffer-column__header">
          {variant === "selected-helper" ? "" : column.column.piece}
        </div>
      )}

      {rows.map((cell) => (
        <div className="buffer-column__cell" key={cell.row.piece}>
          {cell.row.piece} ({cell.row.letter})
        </div>
      ))}
    </div>
  );
}
