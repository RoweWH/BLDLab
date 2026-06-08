import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sheet } from "../../components/sheets/Sheet";
import { getSheet } from "../../api/sheetApi";

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

  if (!sheet) {
    return <div className="page">Loading sheet...</div>;
  }

  return (
    <div className="page">
      <h1>{sheet.name}</h1>

      <Sheet sheet={sheet} />
    </div>
  );
}
