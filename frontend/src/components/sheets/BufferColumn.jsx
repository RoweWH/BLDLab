export function BufferColumn({ pieces = [] }) {
  return (
    <div className="buffer-column">
      {pieces.map((piece, index) => (
        <div className="buffer-column__cell" key={`${piece}-${index}`}>
          {piece}
        </div>
      ))}
    </div>
  );
}
