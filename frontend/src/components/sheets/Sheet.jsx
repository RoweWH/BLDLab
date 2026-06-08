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

  const selectedColumn = columns.find(
    (column) => column.piece === selectedColumnPiece,
  );

  function toggleSelectedColumn(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  function renderBufferColumns(variant = "") {
    return (
      <div className="cycle-sheet__buffer-columns">
        {bufferColumns.map((bufferColumn, index) => (
          <BufferColumn
            key={`buffer-column-${variant}-${index}`}
            pieces={bufferColumn}
            variant={variant}
          />
        ))}
      </div>
    );
  }

  if (selectedColumn) {
    return (
      <div className="cycle-sheet">
        <div className="cycle-sheet__column-group cycle-sheet__column-group--selected">
          <div className="cycle-sheet__selected-body">
            {renderBufferColumns("selected-helper")}

            <Column
              column={selectedColumn}
              type={sheet.type}
              isSelected={true}
              onHeaderClick={toggleSelectedColumn}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-sheet">
      <div
        className="cycle-sheet__buffer-area"
        style={{ "--buffer-count": bufferColumns.length }}
      >
        <div className="cycle-sheet__top-left-header">
          <div>{fixed.join(" ")}</div>
          <div>
            ({countAlgorithms(columns)}/{countCases(columns)})
          </div>
        </div>

        {renderBufferColumns()}
      </div>

      {columns.map((column) => (
        <div className="cycle-sheet__column-group" key={column.piece}>
          <Column
            column={column}
            type={sheet.type}
            isSelected={false}
            onHeaderClick={toggleSelectedColumn}
          />
        </div>
      ))}
    </div>
  );
}
