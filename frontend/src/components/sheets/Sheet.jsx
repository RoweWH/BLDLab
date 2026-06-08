import { useState } from "react";
import { BufferColumn } from "./BufferColumn";
import { Column } from "./Column";

function countAlgorithms(columns = []) {
  return columns.reduce((total, column) => {
    return (
      total +
      column.rows.filter((row) => row.algorithms && row.algorithms.length > 0)
        .length
    );
  }, 0);
}

function countCases(columns = []) {
  return columns.reduce((total, column) => {
    return total + column.rows.filter((row) => row.algorithms).length;
  }, 0);
}

export function Sheet({ sheet }) {
  const [selectedColumnPiece, setSelectedColumnPiece] = useState(null);

  const fixed = sheet.options?.fixed ?? [];
  const bufferColumns = sheet.data?.bufferColumns ?? [];
  const columns = sheet.data?.columns ?? [];

  if (!columns.length) return null;

  function toggleSelectedColumn(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  function renderBufferArea(showHeader = true) {
    return (
      <div
        className="cycle-sheet__buffer-area"
        style={{ "--buffer-count": bufferColumns.length }}
      >
        {showHeader && (
          <div className="cycle-sheet__top-left-header">
            <div>{fixed.join(" ")}</div>
            <div>
              ({countAlgorithms(columns)}/{countCases(columns)})
            </div>
          </div>
        )}

        {!showHeader && <div className="cycle-sheet__top-left-header" />}

        <div className="cycle-sheet__buffer-columns">
          {bufferColumns.map((bufferColumn, index) => (
            <BufferColumn
              key={`buffer-column-${index}`}
              pieces={bufferColumn}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cycle-sheet ${
        selectedColumnPiece ? "cycle-sheet--has-selected-column" : ""
      }`}
    >
      {!selectedColumnPiece && renderBufferArea(true)}

      {columns.map((column) => {
        const isSelected = column.piece === selectedColumnPiece;
        const isBlurred = selectedColumnPiece && !isSelected;

        return (
          <div
            className={`cycle-sheet__column-group ${
              isSelected ? "cycle-sheet__column-group--selected" : ""
            } ${isBlurred ? "cycle-sheet__column-group--blurred" : ""}`}
            key={column.piece}
          >
            {isSelected && renderBufferArea(false)}

            <Column
              column={column}
              type={sheet.type}
              isSelected={isSelected}
              onHeaderClick={toggleSelectedColumn}
            />
          </div>
        );
      })}
    </div>
  );
}
