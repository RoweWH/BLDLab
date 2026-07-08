import { useState } from "react";
import { BufferColumn } from "./BufferColumn";
import "./Sheet.css";
import { Column } from "./Column";
import { TrainingCheckbox } from "./TrainingCheckbox";
import { formatPiecesWithLetters } from "../../utils/sheets/FormatPiecesWithLetters";
import { AlgModal } from "./AlgModal/AlgModal";

function countAlgorithms(columns = []) {
  return columns.reduce(
    (total, column) =>
      total + column.rows.filter((row) => row.algorithms?.length > 0).length,
    0,
  );
}

function countWords(columns = []) {
  return columns.reduce(
    (total, column) =>
      total +
      column.rows.filter((row) => row.id && row.memoryData?.word?.trim())
        .length,
    0,
  );
}

function countCases(columns = []) {
  return columns.reduce(
    (total, column) => total + column.rows.filter((row) => row.id).length,
    0,
  );
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

export function Sheet({
  sheet,
  letterScheme,
  cellDisplayMode,
  onUpdate,
  onToggleCellTraining,
  onToggleColumnTraining,
  onToggleWholeSheetTraining,
}) {
  const [selectedColumnPiece, setSelectedColumnPiece] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const headerInfo = sheet.options?.headerInfo ?? [];
  const bufferColumns = sheet.data?.bufferColumns ?? [];
  const columns = sheet.data?.columns ?? [];

  const algorithmCount = countAlgorithms(columns);
  const wordCount = countWords(columns);
  const caseCount = countCases(columns);

  const validRows = columns.flatMap((column) =>
    column.rows.filter((row) => row.id),
  );

  const wholeSheetTraining =
    validRows.length > 0 && validRows.every((row) => row.training === true);

  function toggleSelectedColumn(piece) {
    setSelectedColumnPiece((current) => (current === piece ? null : piece));
  }

  function openAlgModal(columnPiece, cell) {
    if (!cell?.id) return;

    setSelectedCell({
      ...cell,
      columnPiece,
      buffer: sheet.options?.buffer,
      edgeSwap: sheet.options?.edgeSwap,
      twist: sheet.options?.twistedCorner,
    });
  }

  function closeAlgModal() {
    setSelectedCell(null);
  }

  function saveAlgorithms(algorithms, memoryData) {
    if (!selectedCell?.id || !selectedCell?.columnPiece) return;

    onUpdate(selectedCell.columnPiece, selectedCell.id, algorithms, memoryData);

    setSelectedCell((current) =>
      current
        ? {
            ...current,
            algorithms,
            memoryData,
          }
        : current,
    );
  }

  function toggleModalTraining(columnPiece, caseId, checked) {
    onToggleCellTraining(columnPiece, caseId, checked);

    setSelectedCell((current) =>
      current && String(current.id) === String(caseId)
        ? { ...current, training: checked }
        : current,
    );
  }

  if (!columns.length) return null;

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
                ({cellDisplayMode === "algorithms" ? algorithmCount : wordCount}
                /{caseCount})
              </div>

              <label className="training-control training-control--sheet">
                <TrainingCheckbox
                  checked={wholeSheetTraining}
                  title="Train whole sheet"
                  onChange={onToggleWholeSheetTraining}
                  showAll={true}
                />
              </label>
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
                letterScheme={letterScheme}
                cellDisplayMode={cellDisplayMode}
                isSelected={isSelected}
                onHeaderClick={toggleSelectedColumn}
                onCellClick={(cell) => openAlgModal(column.piece, cell)}
                onToggleCellTraining={onToggleCellTraining}
                onToggleColumnTraining={onToggleColumnTraining}
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
          onSave={saveAlgorithms}
          onToggleTraining={toggleModalTraining}
        />
      )}
    </>
  );
}
