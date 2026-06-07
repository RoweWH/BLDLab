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
  maxSelections = 7,
  showNumbers = true,
}) {
  function isBufferPiece(piece) {
    if (!buffer) return false;

    const buffers = Array.isArray(buffer) ? buffer : [buffer];

    return buffers.some(
      (bufferPiece) => normalizePiece(piece) === normalizePiece(bufferPiece),
    );
  }

  function hasEquivalentSelected(piece) {
    return value.some(
      (selectedPiece) =>
        selectedPiece !== piece &&
        normalizePiece(selectedPiece) === normalizePiece(piece),
    );
  }

  function maxHasBeenReached(corner) {
    return (
      blockEquivalentCorners &&
      maxSelections !== null &&
      value.length >= maxSelections &&
      !value.includes(corner)
    );
  }

  function toggleCorner(corner) {
    if (isBufferPiece(corner)) return;

    if (blockEquivalentCorners && hasEquivalentSelected(corner)) return;

    if (maxHasBeenReached(corner)) return;

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

        const maxSelected = maxHasBeenReached(corner);

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

            {isSelected && showNumbers && (
              <span className="multi-select__order">{orderNumber}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
