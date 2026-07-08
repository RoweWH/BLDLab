import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { SheetHeader } from "../../components/sheets/SheetHeader";
import { getSheet, updateSheet } from "../../api/sheetApi";
import { getCurrentUser } from "../../api/userApi";
import "./SheetView.css";

function getLetterSchemeForSheet(sheet, user) {
  return sheet?.type === "edges"
    ? user?.letterScheme?.edges
    : user?.letterScheme?.corners;
}

function updateSheetCellAlgorithms(
  sheet,
  columnPiece,
  caseId,
  algorithms,
  memoryData,
) {
  return {
    ...sheet,
    data: {
      ...sheet.data,
      columns: sheet.data.columns.map((column) => {
        if (column.piece !== columnPiece) return column;

        return {
          ...column,
          rows: column.rows.map((row) =>
            String(row.id) === String(caseId)
              ? {
                  ...row,
                  algorithms,
                  memoryData: memoryData ?? row.memoryData,
                }
              : row,
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
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cellDisplayMode, setCellDisplayMode] = useState("algorithms");

  useEffect(() => {
    async function loadSheetViewData() {
      try {
        const [sheetResponse, userResponse] = await Promise.all([
          getSheet(id),
          getCurrentUser(),
        ]);

        setSheet(sheetResponse.data);
        setUser(userResponse.data);
      } catch (error) {
        console.error("Failed to load sheet view data:", error);
      }
    }

    loadSheetViewData();
  }, [id]);

  const letterScheme = getLetterSchemeForSheet(sheet, user);

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

  function handleUpdateCellAlgorithms(
    columnPiece,
    caseId,
    algorithms,
    memoryData,
  ) {
    setSheet((currentSheet) => {
      if (!currentSheet) return currentSheet;

      const updatedSheet = updateSheetCellAlgorithms(
        currentSheet,
        columnPiece,
        caseId,
        algorithms,
        memoryData,
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
        <SheetHeader
          sheet={sheet}
          letterScheme={letterScheme}
          cellDisplayMode={cellDisplayMode}
          onCellDisplayModeChange={setCellDisplayMode}
        />

        <Sheet
          sheet={sheet}
          letterScheme={letterScheme}
          cellDisplayMode={cellDisplayMode}
          onUpdate={handleUpdateCellAlgorithms}
          onToggleCellTraining={handleToggleCellTraining}
          onToggleColumnTraining={handleToggleColumnTraining}
          onToggleWholeSheetTraining={handleToggleWholeSheetTraining}
        />
      </div>
    </div>
  );
}
