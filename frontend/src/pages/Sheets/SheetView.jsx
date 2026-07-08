import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { SheetHeader } from "../../components/sheets/SheetHeader";
import { getSheet, updateSheet } from "../../api/sheetApi";
import "./SheetView.css";

function updateSheetCellAlgorithms(sheet, columnPiece, caseId, algorithms) {
  return {
    ...sheet,
    data: {
      ...sheet.data,
      columns: sheet.data.columns.map((column) => {
        if (column.piece !== columnPiece) return column;

        return {
          ...column,
          rows: column.rows.map((row) =>
            String(row.id) === String(caseId) ? { ...row, algorithms } : row,
          ),
        };
      }),
    },
  };
}

function updateSheetCellTraining(sheet, columnPiece, caseId, checked) {
  const startedTraining = new Date().toISOString();

  return {
    ...sheet,
    data: {
      ...sheet.data,
      columns: sheet.data.columns.map((column) => {
        if (column.piece !== columnPiece) return column;

        return {
          ...column,
          rows: column.rows.map((row) => {
            if (String(row.id) !== String(caseId)) return row;

            return {
              ...row,
              training: checked,
              ...(checked ? { startedTraining } : {}),
            };
          }),
        };
      }),
    },
  };
}

function updateSheetColumnTraining(sheet, columnPiece, checked) {
  const startedTraining = new Date().toISOString();

  return {
    ...sheet,
    data: {
      ...sheet.data,
      columns: sheet.data.columns.map((column) => {
        if (column.piece !== columnPiece) return column;

        return {
          ...column,
          rows: column.rows.map((row) => {
            if (!row.id) return row;

            return {
              ...row,
              training: checked,
              ...(checked ? { startedTraining } : {}),
            };
          }),
        };
      }),
    },
  };
}

function updateWholeSheetTraining(sheet, checked) {
  const startedTraining = new Date().toISOString();

  return {
    ...sheet,
    data: {
      ...sheet.data,
      columns: sheet.data.columns.map((column) => ({
        ...column,
        rows: column.rows.map((row) => {
          if (!row.id) return row;

          return {
            ...row,
            training: checked,
            ...(checked ? { startedTraining } : {}),
          };
        }),
      })),
    },
  };
}

export function SheetView() {
  const { id } = useParams();
  const [sheet, setSheet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSheet() {
      try {
        const response = await getSheet(id);
        setSheet(response.data);
      } catch (error) {
        console.error("Failed to load sheet:", error);
      }
    }

    loadSheet();
  }, [id]);

  async function saveSheetVersion(updatedSheet, previousSheet) {
    setIsSaving(true);

    try {
      await updateSheet(id, updatedSheet);
    } catch (error) {
      console.error("Failed to save sheet:", error);
      setSheet(previousSheet);
    } finally {
      setIsSaving(false);
    }
  }

  function handleUpdateCellAlgorithms(columnPiece, caseId, algorithms) {
    setSheet((currentSheet) => {
      if (!currentSheet) return currentSheet;

      const updatedSheet = updateSheetCellAlgorithms(
        currentSheet,
        columnPiece,
        caseId,
        algorithms,
      );

      saveSheetVersion(updatedSheet, currentSheet);

      return updatedSheet;
    });
  }

  function handleToggleCellTraining(columnPiece, caseId, checked) {
    setSheet((currentSheet) => {
      if (!currentSheet) return currentSheet;

      const updatedSheet = updateSheetCellTraining(
        currentSheet,
        columnPiece,
        caseId,
        checked,
      );

      saveSheetVersion(updatedSheet, currentSheet);

      return updatedSheet;
    });
  }

  function handleToggleColumnTraining(columnPiece, checked) {
    setSheet((currentSheet) => {
      if (!currentSheet) return currentSheet;

      const updatedSheet = updateSheetColumnTraining(
        currentSheet,
        columnPiece,
        checked,
      );

      saveSheetVersion(updatedSheet, currentSheet);

      return updatedSheet;
    });
  }

  function handleToggleWholeSheetTraining(checked) {
    setSheet((currentSheet) => {
      if (!currentSheet) return currentSheet;

      const updatedSheet = updateWholeSheetTraining(currentSheet, checked);

      saveSheetVersion(updatedSheet, currentSheet);

      return updatedSheet;
    });
  }

  if (!sheet) {
    return <div className="page">Loading sheet...</div>;
  }

  return (
    <div className="page sheet-view-page">
      <div className="sheet-view">
        <SheetHeader sheet={sheet} isSaving={isSaving} />

        <Sheet
          sheet={sheet}
          onUpdate={handleUpdateCellAlgorithms}
          onToggleCellTraining={handleToggleCellTraining}
          onToggleColumnTraining={handleToggleColumnTraining}
          onToggleWholeSheetTraining={handleToggleWholeSheetTraining}
        />
      </div>
    </div>
  );
}
