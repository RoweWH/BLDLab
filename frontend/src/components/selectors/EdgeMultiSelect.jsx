import { edgePieces } from "../../data/EdgePieces";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

export function EdgeMultiSelect({ value, onChange, buffer }) {
  function isBufferPiece(piece) {
    return buffer && normalizePiece(piece) === normalizePiece(buffer);
  }

  function toggleEdge(edge) {
    if (isBufferPiece(edge)) {
      return;
    }

    if (value.includes(edge)) {
      onChange(value.filter((x) => x !== edge));
    } else {
      onChange([...value, edge]);
    }
  }

  const filteredEdges = edgePieces.filter(
    (edge) =>
      edge.startsWith("U") ||
      edge.startsWith("D") ||
      edge === "FR" ||
      edge === "FL" ||
      edge === "BR" ||
      edge === "BL",
  );

  return (
    <div className="multi-select edge-multi-select">
      {filteredEdges.map((edge) => {
        const disabled = isBufferPiece(edge);
        const selected = value.includes(edge) || disabled;

        return (
          <button
            type="button"
            key={edge}
            disabled={disabled}
            className={
              selected
                ? "multi-select__button selected"
                : "multi-select__button"
            }
            onClick={() => toggleEdge(edge)}
          >
            {edge}
          </button>
        );
      })}
    </div>
  );
}
