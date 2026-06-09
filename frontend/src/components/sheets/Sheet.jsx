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

  const algorithmCount = countAlgorithms(columns);
  const caseCount = countCases(columns);

  if (!columns.length) return null;

  function toggleSelectedColumn(piece) {
    if (selectedColumnPiece === piece) {
      setSelectedColumnPiece(null);
    } else {
      setSelectedColumnPiece(piece);
    }
  }

  return (
    <div className="cycle-sheet">
      {!selectedColumnPiece && (
        <div
          className="cycle-sheet__buffer-area"
          style={{ "--buffer-count": bufferColumns.length }}
        >
          <div className="cycle-sheet__top-left-header">
            <div>{fixed.join(" ")}</div>
            <div>
              ({algorithmCount}/{caseCount})
            </div>
          </div>

          <div className="cycle-sheet__buffer-columns">
            {bufferColumns.map((bufferColumn, index) => (
              <BufferColumn
                key={`main-buffer-column-${index}`}
                pieces={bufferColumn}
              />
            ))}
          </div>
        </div>
      )}

      {columns.map((column) => {
        const isSelected = selectedColumnPiece === column.piece;
        const isBlurred = selectedColumnPiece && !isSelected;

        return (
          <div
            key={column.piece}
            className={`cycle-sheet__column-group ${
              isSelected ? "cycle-sheet__column-group--selected" : ""
            } ${isBlurred ? "cycle-sheet__column-group--blurred" : ""}`}
          >
            {isSelected && (
              <div
                className="cycle-sheet__buffer-area"
                style={{ "--buffer-count": bufferColumns.length }}
              >
                <div className="cycle-sheet__top-left-header" />

                <div className="cycle-sheet__buffer-columns">
                  {bufferColumns.map((bufferColumn, index) => (
                    <BufferColumn
                      key={`selected-buffer-column-${index}`}
                      pieces={bufferColumn}
                    />
                  ))}
                </div>
              </div>
            )}

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
