export function BufferColumn({ pieces = [], variant = "" }) {
  return (
    <div
      className={`buffer-column ${variant ? `buffer-column--${variant}` : ""}`}
    >
      {pieces.map((piece, index) => (
        <div className="buffer-column__cell" key={`${piece}-${index}`}>
          {piece}
        </div>
      ))}
    </div>
  );
}
