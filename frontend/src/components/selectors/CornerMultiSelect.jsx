import { cornerPieces } from "../../data/pieces/CornerPieces";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

export function CornerMultiSelect({
  value,
  onChange,
  buffer,
  showAllCorners = false,
  blockEquivalentCorners = false,
}) {
  function isBufferPiece(piece) {
    return buffer && normalizePiece(piece) === normalizePiece(buffer);
  }

  function hasEquivalentSelected(piece) {
    return value.some(
      (selectedPiece) =>
        selectedPiece !== piece &&
        normalizePiece(selectedPiece) === normalizePiece(piece),
    );
  }

  function toggleCorner(corner) {
    if (isBufferPiece(corner)) {
      return;
    }

    if (blockEquivalentCorners && hasEquivalentSelected(corner)) {
      return;
    }

    if (value.includes(corner)) {
      onChange(value.filter((x) => x !== corner));
    } else {
      onChange([...value, corner]);
    }
  }

  const cornersToShow = showAllCorners
    ? cornerPieces
    : cornerPieces.filter(
        (corner) => corner.startsWith("U") || corner.startsWith("D"),
      );

  return (
    <div className="multi-select corner-multi-select">
      {cornersToShow.map((corner) => {
        const isSelected = value.includes(corner);
        const isBuffer = isBufferPiece(corner);
        const orderNumber = value.indexOf(corner) + 1;

        const maxSelected =
          blockEquivalentCorners && value.length >= 7 && !isSelected;

        const disabled =
          isBuffer ||
          maxSelected ||
          (blockEquivalentCorners && hasEquivalentSelected(corner));

        const selected = isSelected || isBuffer;

        return (
          <button
            type="button"
            key={corner}
            disabled={disabled}
            className={[
              "multi-select__button",
              selected ? "selected" : "",
              disabled && !selected ? "disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => toggleCorner(corner)}
          >
            <span>{corner}</span>

            {isSelected && (
              <span className="multi-select__order">{orderNumber}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
