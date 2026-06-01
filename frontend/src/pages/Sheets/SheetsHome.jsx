import { useEffect, useState } from "react";
import { createNewSheet, getSheets } from "../../BLDDBapi";

export function SheetsHome() {
  const [sheets, setSheets] = useState([]);
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

  async function createSheet() {
    const newSheet = {
      name: "UF",
      type: "edge",
      createdDate: new Date(),
      data: {},
    };

    try {
      const response = await createNewSheet(newSheet);

      setSheets([...sheets, response.data.sheet]);
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
        {sheets.map((sheet) => (
          <div className="sheet-card" key={sheet._id}>
            <h3>{sheet.name}</h3>
            <p>{sheet.type}</p>
          </div>
        ))}

        <button className="add-sheet-card" onClick={createSheet}>
          +
        </button>
      </div>
    </div>
  );
}
