import { useState } from "react";
import { BufferColumn } from "./BufferColumn";
import { CycleSheetColumn } from "./CycleSheetColumn";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isExcluded(piece, exclude = []) {
  const normalizedPiece = normalizePiece(piece);

  return exclude
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

export function CycleSheet({ sheet }) {
  const [selectedColumnPiece, setSelectedColumnPiece] = useState(null);

  if (!sheet?.data?.columns?.length) {
    return null;
  }

  const exclude = sheet.options?.exclude ?? [];

  const bufferColumn = sheet.data.columns[0];

  const cycleColumns = sheet.data.columns
    .slice(1)
    .filter((column) => !isExcluded(column.column.piece, exclude));

  function handleColumnHeaderClick(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  return (
    <div className="cycle-sheet">
      <BufferColumn column={bufferColumn} exclude={exclude} />

      {cycleColumns.map((column) => {
        const isSelected = selectedColumnPiece === column.column.piece;

        return (
          <div className="cycle-sheet__column-group" key={column.column.piece}>
            {isSelected && (
              <BufferColumn
                column={bufferColumn}
                exclude={exclude}
                variant="selected-helper"
              />
            )}

            <CycleSheetColumn
              column={column}
              type={sheet.type}
              exclude={exclude}
              isSelected={isSelected}
              onHeaderClick={handleColumnHeaderClick}
            />
          </div>
        );
      })}
    </div>
  );
}
