import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSheet, getSheets } from "../../api/sheetApi";
import { CreateSheetModal } from "../../components/sheets/CreateSheetModal";
import { buildCycleSheet } from "../../data/SheetBuilds/BuildCycleSheet";
import { getCurrentUser } from "../../api/userApi";

export function SheetsHome() {
  const [sheets, setSheets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create sheet:", error);
    }
  }

  function openSheet(sheetId) {
    navigate(`/sheets/${sheetId}`);
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
          <button
            type="button"
            className="sheet-card"
            key={sheet._id}
            onClick={() => openSheet(sheet._id)}
          >
            <h3>{sheet.name}</h3>
            <p>{sheet.type}</p>
          </button>
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
