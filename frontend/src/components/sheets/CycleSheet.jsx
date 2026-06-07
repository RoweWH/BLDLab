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

function splitColumns(columns) {
  const hasMarkedBuffers = columns.some((column) => column.isBuffer);

  if (!hasMarkedBuffers) {
    return {
      bufferColumns: [columns[0]],
      cycleColumns: columns.slice(1),
    };
  }

  return {
    bufferColumns: columns.filter((column) => column.isBuffer),
    cycleColumns: columns.filter((column) => !column.isBuffer),
  };
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

  const { bufferColumns, cycleColumns: rawCycleColumns } = splitColumns(
    sheet.data.columns,
  );

  const cycleColumns = rawCycleColumns.filter(
    (column) => !isExcluded(column.column.piece, exclude),
  );

  const loadedCount = countAlgorithms(cycleColumns, exclude);
  const possibleCount = countCases(cycleColumns, exclude);

  function handleColumnHeaderClick(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  return (
    <div className="cycle-sheet">
      {!selectedColumnPiece && (
        <div
          className="cycle-sheet__buffer-area"
          style={{
            "--buffer-count": bufferColumns.length,
          }}
        >
          <div className="cycle-sheet__top-left-header">
            <div>
              {bufferColumns
                .map((bufferColumn) => bufferColumn.column.piece)
                .join(" ")}
            </div>

            <div>
              ({loadedCount}/{possibleCount})
            </div>
          </div>

          <div className="cycle-sheet__buffer-columns">
            {bufferColumns.map((bufferColumn, index) => (
              <BufferColumn
                key={`${bufferColumn.column.piece}-${index}`}
                column={bufferColumn}
                exclude={exclude}
                hideHeader={true}
              />
            ))}
          </div>
        </div>
      )}

      {cycleColumns.map((column) => {
        const isSelected = selectedColumnPiece === column.column.piece;

        if (isSelected) {
          return (
            <div
              className="cycle-sheet__column-group cycle-sheet__column-group--selected"
              key={column.column.piece}
            >
              <div className="cycle-sheet__selected-layout">
                <button
                  type="button"
                  className="cycle-sheet__selected-header"
                  onClick={() => handleColumnHeaderClick(column.column.piece)}
                >
                  {column.column.piece} ({column.column.letter})
                </button>

                <div className="cycle-sheet__selected-body">
                  <div className="cycle-sheet__buffer-columns">
                    {bufferColumns.map((bufferColumn, index) => (
                      <BufferColumn
                        key={`${bufferColumn.column.piece}-${index}`}
                        column={bufferColumn}
                        exclude={exclude}
                        variant="selected-helper"
                        hideHeader={true}
                      />
                    ))}
                  </div>

                  <CycleSheetColumn
                    column={column}
                    type={sheet.type}
                    exclude={exclude}
                    isSelected={isSelected}
                    onHeaderClick={handleColumnHeaderClick}
                    hideHeader={true}
                  />
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="cycle-sheet__column-group" key={column.column.piece}>
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
