import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { getSheet, updateSheet } from "../../api/sheetApi";

function updateSheetCellAlgorithms(sheet, columnPiece, caseId, algorithms) {
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
              algorithms,
            };
          }),
        };
      }),
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

  async function handleUpdateCellAlgorithms(columnPiece, caseId, algorithms) {
    if (!sheet) return;

    const updatedSheet = updateSheetCellAlgorithms(
      sheet,
      columnPiece,
      caseId,
      algorithms,
    );

    setSheet(updatedSheet);
    setIsSaving(true);

    try {
      await updateSheet(id, updatedSheet);
    } catch (error) {
      console.error("Failed to save sheet:", error);
      setSheet(sheet);
    } finally {
      setIsSaving(false);
    }
  }

  if (!sheet) {
    return <div className="page">Loading sheet...</div>;
  }

  return (
    <div className="page">
      <h1>{sheet.name}</h1>

      {isSaving && <p>Saving...</p>}

      <Sheet sheet={sheet} onUpdate={handleUpdateCellAlgorithms} />
    </div>
  );
}
