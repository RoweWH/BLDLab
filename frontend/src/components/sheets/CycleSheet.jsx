import { useState } from "react";
import { BufferColumn } from "./BufferColumn";
import { CycleSheetColumn } from "./CycleSheetColumn";

function normalizePiece(piece) {
  return piece.replace(/[()]/g, "").split("").sort().join("");
}

function isExcluded(piece, exclude = []) {
  const normalizedPiece = normalizePiece(piece);

  return exclude
    .map((excludedPiece) => normalizePiece(excludedPiece))
    .includes(normalizedPiece);
}

function getBufferColumns(columns) {
  const markedBufferColumns = columns.filter((column) => column.isBuffer);

  if (markedBufferColumns.length > 0) {
    return markedBufferColumns;
  }

  return [columns[0]];
}

function getCycleColumns(columns, bufferColumns) {
  const bufferPieces = bufferColumns.map((column) => column.column.piece);

  return columns.filter(
    (column) => !bufferPieces.includes(column.column.piece)
  );
}

function countAlgorithms(cycleColumns, exclude = []) {
  return cycleColumns.reduce((total, column) => {
    return (
      total +
      column.rows.reduce((sum, row) => {
        const excluded =
          isExcluded(column.column.piece, exclude) ||
          isExcluded(row.row.piece, exclude);

        const invalid =
          excluded || (typeof row.invalid === "boolean" && row.invalid);

        return invalid ? sum : sum + row.algorithms.length;
      }, 0)
    );
  }, 0);
}

function countCases(cycleColumns, exclude = []) {
  return cycleColumns.reduce((total, column) => {
    return (
      total +
      column.rows.reduce((sum, row) => {
        const excluded =
          isExcluded(column.column.piece, exclude) ||
          isExcluded(row.row.piece, exclude);

        const samePiece =
          normalizePiece(column.column.piece) === normalizePiece(row.row.piece);

        const invalid =
          excluded ||
          (typeof row.invalid === "boolean" ? row.invalid : samePiece);

        return invalid ? sum : sum + 1;
      }, 0)
    );
  }, 0);
}

export function CycleSheet({ sheet }) {
  const [selectedColumnPiece, setSelectedColumnPiece] = useState(null);

  if (!sheet?.data?.columns?.length) {
    return null;
  }

  const exclude = sheet.options?.exclude ?? [];

  const bufferColumns = getBufferColumns(sheet.data.columns);
  const cycleColumns = getCycleColumns(sheet.data.columns, bufferColumns).filter(
    (column) => !isExcluded(column.column.piece, exclude)
  );

  const loadedCount = countAlgorithms(cycleColumns, exclude);
  const possibleCount = countCases(cycleColumns, exclude);

  function handleColumnHeaderClick(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  return (
    <div className="cycle-sheet">
      {!selectedColumnPiece && (
        <div className="cycle-sheet__buffer-area">
          <div className="cycle-sheet__top-left-header">
            <div>
              {bufferColumns
                .map((bufferColumn) => bufferColumn.column.piece)
                .join(" / ")}
            </div>

            <div>
              ({loadedCount}/{possibleCount})
            </div>
          </div>

          {bufferColumns.map((bufferColumn) => (
            <BufferColumn
              key={bufferColumn.column.piece}
              column={bufferColumn}
              exclude={exclude}
              hideHeader={true}
            />
          ))}
        </div>
      )}

      {cycleColumns.map((column) => {
        const isSelected = selectedColumnPiece === column.column.piece;

        return (
          <div className="cycle-sheet__column-group" key={column.column.piece}>
            {isSelected &&
              bufferColumns.map((bufferColumn) => (
                <BufferColumn
                  key={bufferColumn.column.piece}
                  column={bufferColumn}
                  exclude={exclude}
                  variant="selected-helper"
                />
              ))}

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