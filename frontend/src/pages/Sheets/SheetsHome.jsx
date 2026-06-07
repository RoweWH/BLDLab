import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSheet, getSheets } from "../../api/sheetApi";
import { CreateSheetModal } from "../../components/sheets/CreateSheetModal";
import { buildCycleSheet } from "../../utils/sheets/BuildCycleSheet";
import { build2e2cSheet } from "../../utils/sheets/Build2e2cSheet";
import { buildLTCTSheet } from "../../utils/sheets/BuildLTCTSheet";
import { buildT2CSheet } from "../../utils/sheets/BuildT2CSheet";
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
      const response = await getCurrentUser();
      const user = response.data;
      if (newSheet.type === "edges" || newSheet.type === "corners") {
        populatedSheet = await buildCycleSheet(newSheet, user);
      } else if (newSheet.type === "2e2c") {
        populatedSheet = await build2e2cSheet(newSheet, user);
      } else if (newSheet.type === "ltct") {
        populatedSheet = await buildLTCTSheet(newSheet, user);
      } else if (newSheet.type === "t2c") {
        populatedSheet = await buildT2CSheet(newSheet, user);
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
