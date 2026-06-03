import { useEffect, useState } from "react";
import { createNewSheet, getSheets } from "../../BLDDBapi";
import { CreateSheetModal } from "../../components/sheets/CreateSheetModal";
import { buildCycleSheet } from "../../data/SheetBuilds/BuildCycleSheet";
import { getCurrentUser } from "../../BLDDBapi";

export function SheetsHome() {
  const [sheets, setSheets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSheets() {
      try {
        const response = await getSheets();
        setSheets(response.data);
      } catch (error) {
        console.error("Failed to load sheets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSheets();
  }, []);

  async function createSheet(newSheet) {
    try {
      let populatedSheet;

      if (newSheet.type === "edges" || newSheet.type === "corners") {
        const response = await getCurrentUser();
        const user = response.data;

        populatedSheet = await buildCycleSheet(newSheet, user);
      } else {
        populatedSheet = newSheet;
      }

      const sheetResponse = await createNewSheet(populatedSheet);

      setSheets([...sheets, sheetResponse.data.sheet]);
    } catch (error) {
      console.error("Failed to create sheet:", error);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1>My Sheets</h1>
        <p>Loading sheets...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Sheets</h1>

      <div className="sheet-grid">
        <button
          className="add-sheet-card"
          onClick={() => setShowCreateModal(true)}
        >
          +
        </button>
        {sheets.map((sheet) => (
          <div className="sheet-card" key={sheet._id}>
            <h3>{sheet.name}</h3>
            <p>{sheet.type}</p>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateSheetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createSheet}
        />
      )}
    </div>
  );
}
