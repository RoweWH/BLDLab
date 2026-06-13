import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { getSheet, updateSheet } from "../../api/sheetApi";

function getUpdatedSheet(current, columnPiece, rowId, algorithms) {
  return {
    ...current,
    data: {
      ...current.data,
      columns: current.data.columns.map((column) => {
        if (column.piece !== columnPiece) return column;

        return {
          ...column,
          rows: column.rows.map((row) => {
            if (row.id !== rowId) return row;

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

  async function updateCellAlgorithms(columnPiece, rowId, algorithms) {
    if (!sheet) return;

    const updatedSheet = getUpdatedSheet(sheet, columnPiece, rowId, algorithms);

    setSheet(updatedSheet);

    try {
      await updateSheet(id, updatedSheet);
    } catch (error) {
      console.error("Failed to save sheet:", error);
    }
  }

  if (!sheet) {
    return <div className="page">Loading sheet...</div>;
  }

  return (
    <div className="page">
      <h1>{sheet.name}</h1>

      <Sheet sheet={sheet} onUpdate={updateCellAlgorithms} />
    </div>
  );
}
