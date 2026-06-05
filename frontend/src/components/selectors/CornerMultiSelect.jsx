import { cornerPieces } from "../../data/pieces/CornerPieces";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

export function CornerMultiSelect({ value, onChange, buffer }) {
  function isBufferPiece(piece) {
    return buffer && normalizePiece(piece) === normalizePiece(buffer);
  }

  function toggleCorner(corner) {
    if (isBufferPiece(corner)) {
      return;
    }

    if (value.includes(corner)) {
      onChange(value.filter((x) => x !== corner));
    } else {
      onChange([...value, corner]);
    }
  }

  const filteredCorners = cornerPieces.filter(
    (corner) => corner.startsWith("U") || corner.startsWith("D"),
  );

  return (
    <div className="multi-select corner-multi-select">
      {filteredCorners.map((corner) => {
        const disabled = isBufferPiece(corner);
        const selected = value.includes(corner) || disabled;

        return (
          <button
            type="button"
            key={corner}
            disabled={disabled}
            className={
              selected
                ? "multi-select__button selected"
                : "multi-select__button"
            }
            onClick={() => toggleCorner(corner)}
          >
            {corner}
          </button>
        );
      })}
    </div>
  );
}
