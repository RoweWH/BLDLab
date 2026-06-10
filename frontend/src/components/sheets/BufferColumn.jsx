export function BufferColumn({
  pieces = [],
  multiplier = 1,
  selected = false
}) {
  const baseHeight = selected
    ? "var(--sheet-selected-cell-height)"
    : "var(--sheet-cell-height)";

  return (
    <div className="buffer-column">
      {pieces.map((piece, index) => (
        <div
          className="buffer-column__cell"
          style={{
            height: `calc(${baseHeight} * ${multiplier})`,
          }}
          key={`${piece}-${index}`}
        >
          {piece}
        </div>
      ))}
    </div>
  );
}
