import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { SheetHeader } from "../../components/sheets/SheetHeader";
import { deleteSheet, getSheet, updateSheet } from "../../api/sheetApi";
import { getCurrentUser } from "../../api/userApi";
import {
  deleteLocalSheet,
  getLocalSheetById,
  isLocalSheetId,
  saveLocalSheet,
} from "../../storage/sheetStorage";
import { getLocalSettings } from "../../storage/settingsStorage";
import "./SheetView.css";
import { exportSheetCsv } from "../../utils/sheets/exportSheetCsv";

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
  const navigate = useNavigate();

  const [sheet, setSheet] = useState(null);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cellDisplayMode, setCellDisplayMode] = useState("algorithms");

  useEffect(() => {
    async function loadSheetViewData() {
      try {
        if (isLocalSheetId(id)) {
          const [localSheet, localSettings] = await Promise.all([
            getLocalSheetById(id),
            getLocalSettings(),
          ]);

          setSheet(localSheet);
          setUser({
            letterScheme: localSettings.letterScheme,
          });

          return;
        }

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

  async function handleDeleteSheet() {
    try {
      if (isLocalSheetId(id)) {
        await deleteLocalSheet(id);
      } else {
        await deleteSheet(id);
      }

      navigate("/sheets");
    } catch (error) {
      console.error("Failed to delete sheet:", error);
    }
  }

  async function saveSheetVersion(updatedSheet, previousSheet) {
    setIsSaving(true);

    try {
      if (isLocalSheetId(id)) {
        await saveLocalSheet(updatedSheet);
      } else {
        await updateSheet(id, updatedSheet);
      }
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

  function handleExportCsv() {
    exportSheetCsv(sheet, cellDisplayMode, letterScheme);
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
          onDelete={handleDeleteSheet}
          onExportCsv={handleExportCsv}
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
