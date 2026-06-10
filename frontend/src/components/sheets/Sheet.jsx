import { useState, useEffect } from "react";
import { BufferColumn } from "./BufferColumn";
import { Column } from "./Column";
import { getCurrentUser } from "../../api/userApi";
import { formatPiecesWithLetters } from "../../utils/sheets/FormatPiecesWithLetters";
import { AlgModal } from "./AlgModal";

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

function getBufferColumnMultiplier(bufferColumns = [], index) {
  return 2 ** (bufferColumns.length - index - 1);
}

function renderBufferColumns(bufferColumns, letterScheme, selected = false) {
  return bufferColumns.map((bufferColumn, index) => {
    const multiplier = getBufferColumnMultiplier(bufferColumns, index);

    return (
      <BufferColumn
        key={`${selected ? "selected" : "normal"}-buffer-column-${index}`}
        pieces={formatPiecesWithLetters(bufferColumn, letterScheme)}
        multiplier={multiplier}
        selected={selected}
      />
    );
  });
}

export function Sheet({ sheet }) {
  const [selectedColumnPiece, setSelectedColumnPiece] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const response = await getCurrentUser();
      setUser(response.data);
    }

    loadUser();
  }, []);

  const letterScheme =
    sheet.type === "edges"
      ? user?.letterScheme?.edges
      : user?.letterScheme?.corners;

  const headerInfo = sheet.options?.headerInfo ?? [];
  const bufferColumns = sheet.data?.bufferColumns ?? [];
  const columns = sheet.data?.columns ?? [];

  const algorithmCount = countAlgorithms(columns);
  const caseCount = countCases(columns);

  if (!columns.length) return null;

  function toggleSelectedColumn(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  function openAlgModal(cell) {
    setSelectedCell(cell);
  }

  function closeAlgModal() {
    setSelectedCell(null);
  }

  return (
    <>
      <div className="cycle-sheet">
        {!selectedColumnPiece && (
          <div
            className="cycle-sheet__buffer-area"
            style={{ "--buffer-count": bufferColumns.length }}
          >
            <div className="cycle-sheet__top-left-header">
              <div>{headerInfo.join(" ")}</div>
              <div>
                ({algorithmCount}/{caseCount})
              </div>
            </div>

            <div className="cycle-sheet__buffer-columns">
              {renderBufferColumns(bufferColumns, letterScheme)}
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
                    {renderBufferColumns(bufferColumns, letterScheme, true)}
                  </div>
                </div>
              )}

              <Column
                column={column}
                type={sheet.type}
                letterScheme={letterScheme}
                isSelected={isSelected}
                onHeaderClick={toggleSelectedColumn}
                onCellClick={openAlgModal}
              />
            </div>
          );
        })}
      </div>

      {selectedCell && (
        <AlgModal
          cell={selectedCell}
          type={sheet.type}
          onClose={closeAlgModal}
        />
      )}
    </>
  );
}
