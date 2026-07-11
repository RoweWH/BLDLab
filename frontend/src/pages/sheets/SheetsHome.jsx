import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSheet, getSheets } from "../../api/sheetApi";
import { getCurrentUser } from "../../api/userApi";
import { CreateSheetModal } from "../../components/sheets/CreateSheetModal";
import { buildCycleSheet } from "../../utils/sheets/BuildCycleSheet";
import { build2e2cSheet } from "../../utils/sheets/Build2e2cSheet";
import { buildLTCTSheet } from "../../utils/sheets/BuildLTCTSheet";
import { buildT2CSheet } from "../../utils/sheets/BuildT2CSheet";
import { getLocalSheets, saveLocalSheet } from "../../storage/sheetStorage";
import { getLocalSettings } from "../../storage/settingsStorage";
import defaultUF from "../../data/defaultSheets/defaultUF";
import defaultUFR from "../../data/defaultSheets/defaultUFR";
import default2E2C from "../../data/defaultSheets/default2E2C";
import defaultLTCT from "../../data/defaultSheets/defaultLTCT";
import defaultT2C from "../../data/defaultSheets/defaultT2C";

import "./SheetsHome.css";

export function SheetsHome() {
  const [sheets, setSheets] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadSheets() {
      try {
        const userResponse = await getCurrentUser();
        const currentUser = userResponse.data;

        setUser(currentUser);

        const sheetResponse = await getSheets();
        setSheets(sheetResponse.data);
      } catch {
        setUser(null);

        let localSheets = await getLocalSheets();

        if (localSheets.length === 0) {
          const defaultSheetTemplates = [
            {
              sheet: defaultUF,
              id: "local-defaultUF",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
            {
              sheet: defaultUFR,
              id: "local-defaultUFR",
              createdAt: "2026-01-02T00:00:00.000Z",
            },
            {
              sheet: default2E2C,
              id: "local-default2E2C",
              createdAt: "2026-01-03T00:00:00.000Z",
            },
            {
              sheet: defaultLTCT,
              id: "local-defaultLTCT",
              createdAt: "2026-01-04T00:00:00.000Z",
            },
            {
              sheet: defaultT2C,
              id: "local-defaultT2C",
              createdAt: "2026-01-05T00:00:00.000Z",
            },
          ];

          const savedDefaultSheets = await Promise.all(
            defaultSheetTemplates.map(async ({ sheet, id }) => {
              const defaultSheet = structuredClone(sheet);

              defaultSheet._id = id;

              return saveLocalSheet(defaultSheet);
            }),
          );

          localSheets = savedDefaultSheets;
        }

        setSheets(localSheets);
      } finally {
        setLoading(false);
      }
    }

    loadSheets();
  }, []);

  async function buildSheet(newSheet, activeUser) {
    if (newSheet.type === "edges" || newSheet.type === "corners") {
      return buildCycleSheet(newSheet, activeUser);
    }

    if (newSheet.type === "2e2c") {
      return build2e2cSheet(newSheet, activeUser);
    }

    if (newSheet.type === "ltct") {
      return buildLTCTSheet(newSheet, activeUser);
    }

    if (newSheet.type === "t2c") {
      return buildT2CSheet(newSheet, activeUser);
    }

    return newSheet;
  }

  async function getGuestUser() {
    const settings = await getLocalSettings();

    return {
      letterScheme: settings.letterScheme,
    };
  }

  async function createSheet(newSheet) {
    try {
      const activeUser = user ?? (await getGuestUser());
      const populatedSheet = await buildSheet(newSheet, activeUser);

      if (user) {
        const sheetResponse = await createNewSheet(populatedSheet);

        setSheets((currentSheets) => [
          ...currentSheets,
          sheetResponse.data.sheet,
        ]);
      } else {
        const savedSheet = await saveLocalSheet(populatedSheet);

        setSheets((currentSheets) => [...currentSheets, savedSheet]);
      }

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
        <p>Loading sheets...</p>
      </div>
    );
  }

  return (
    <div className="page">
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
