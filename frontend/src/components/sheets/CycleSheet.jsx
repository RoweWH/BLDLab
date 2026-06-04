import { BufferColumn } from "./BufferColumn";
import { CycleSheetColumn } from "./CycleSheetColumn";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, excluded = []) {
  const normalizedPiece = normalizePiece(piece);

  return excluded
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function CycleSheet({ sheet }) {
  if (!sheet?.data?.columns?.length) {
    return null;
  }

  const excluded = sheet.options?.exclude ?? [];

  const bufferColumn = sheet.data.columns[0];

  const cycleColumns = sheet.data.columns
    .slice(1)
    .filter((column) => !isExcluded(column.column.piece, excluded));

  return (
    <div className="cycle-sheet">
      <BufferColumn column={bufferColumn} excluded={excluded} />

      {cycleColumns.map((column) => (
        <CycleSheetColumn
          key={column.column.piece}
          column={column}
          type={sheet.type}
          excluded={excluded}
        />
      ))}
    </div>
  );
}
