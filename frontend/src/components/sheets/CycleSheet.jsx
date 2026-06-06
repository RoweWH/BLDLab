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

function countAlgorithms(columns, exclude = []) {
  return columns.slice(1).reduce((total, column) => {
    return (
      total +
      column.rows.reduce((sum, row) => {
        const excluded =
          isExcluded(column.column.piece, exclude) ||
          isExcluded(row.row.piece, exclude);

        return excluded ? sum : sum + row.algorithms.length;
      }, 0)
    );
  }, 0);
}

function countCases(columns, exclude = [], type) {
  const cycleColumns = columns.slice(1);

  return cycleColumns.reduce((total, column, columnIndex) => {
    return (
      total +
      column.rows.reduce((sum, row) => {
        const excluded =
          isExcluded(column.column.piece, exclude) ||
          isExcluded(row.row.piece, exclude);

        const samePiece =
          normalizePiece(column.column.piece) === normalizePiece(row.row.piece);

        let invalid = excluded || samePiece;

        if (type === "2e2c") {
          const previousAndCurrentColumns = cycleColumns
            .slice(0, columnIndex + 1)
            .map((col) => col.column.piece);

          const blockedByPreviousBuffer = previousAndCurrentColumns.some(
            (piece) => normalizePiece(piece) === normalizePiece(row.row.piece),
          );

          invalid = excluded || blockedByPreviousBuffer;
        }

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

  const bufferColumn = sheet.data.columns[0];

  const cycleColumns = sheet.data.columns
    .slice(1)
    .filter((column) => !isExcluded(column.column.piece, exclude));

  const loadedCount = countAlgorithms(sheet.data.columns, exclude);
  const possibleCount = countCases(sheet.data.columns, exclude, sheet.type);

  function handleColumnHeaderClick(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  return (
    <div className="cycle-sheet">
      {!selectedColumnPiece && (
        <div className="cycle-sheet__buffer-area">
          <div className="cycle-sheet__top-left-header">
            <div>{bufferColumn.column.piece}</div>
            <div>
              ({loadedCount}/{possibleCount})
            </div>
          </div>

          <BufferColumn
            column={bufferColumn}
            exclude={exclude}
            hideHeader={true}
          />
        </div>
      )}

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
