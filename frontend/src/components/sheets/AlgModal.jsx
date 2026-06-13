import { useEffect, useState } from "react";
import {
  getEdgeAlgs,
  getCornerAlgs,
  getEdgeAlgById,
  getCornerAlgById,
  getParityAlgById,
} from "../../api/algApi";
import "./AlgModal.css";

export function AlgModal({
  cell,
  columnPiece,
  options,
  type,
  onClose,
  onSave,
}) {
  const [databaseAlgs, setDatabaseAlgs] = useState([]);
  const [sheetAlgs, setSheetAlgs] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);

  const buffer = options?.buffer;
  const firstTarget = columnPiece;
  const secondTarget = cell.piece;

  useEffect(() => {
    async function loadDatabaseAlgs() {
      try {
        let response;

        if (type === "edges") {
          response = await getEdgeAlgs(buffer, firstTarget, secondTarget);
        } else if (type === "corners") {
          response = await getCornerAlgs(buffer, firstTarget, secondTarget);
        } else {
          setDatabaseAlgs([]);
          return;
        }

        setDatabaseAlgs(response.data.algorithms ?? []);
      } catch (error) {
        console.error("Failed to load database algs:", error);
        setDatabaseAlgs([]);
      }
    }

    loadDatabaseAlgs();
  }, [type, buffer, firstTarget, secondTarget]);

  useEffect(() => {
    async function loadSheetAlgs() {
      const storedAlgs = cell.algorithms ?? [];

      if (storedAlgs.length === 0) {
        setSheetAlgs([]);
        setPrimaryId(null);
        return;
      }

      try {
        const loadedAlgs = await Promise.all(
          storedAlgs.map(async (storedAlg) => {
            let response;

            if (type === "edges") {
              response = await getEdgeAlgById(storedAlg.algorithm);
            } else if (type === "corners") {
              response = await getCornerAlgById(storedAlg.algorithm);
            } else {
              response = await getParityAlgById(storedAlg.algorithm);
            }

            return {
              id: storedAlg.algorithm,
              text:
                response.data.algorithm ??
                response.data.Algorithm ??
                response.data,
              primary: storedAlg.primary,
            };
          }),
        );

        setSheetAlgs(loadedAlgs);

        const primary = loadedAlgs.find((alg) => alg.primary);
        setPrimaryId(primary?.id ?? null);
      } catch (error) {
        console.error("Failed to load sheet algs:", error);
        setSheetAlgs([]);
        setPrimaryId(null);
      }
    }

    loadSheetAlgs();
  }, [cell, type]);

  function algIsSelected(algId) {
    return sheetAlgs.some((sheetAlg) => sheetAlg.id === algId);
  }

  function toggleAlg(alg) {
    if (algIsSelected(alg.id)) {
      removeAlg(alg.id);
      return;
    }

    const shouldBePrimary = sheetAlgs.length === 0;

    const newAlg = {
      id: alg.id,
      text: alg.algorithm,
      primary: shouldBePrimary,
    };

    setSheetAlgs((current) => [...current, newAlg]);

    if (shouldBePrimary) {
      setPrimaryId(alg.id);
    }
  }

  function removeAlg(algId) {
    setSheetAlgs((current) => {
      const updated = current.filter((alg) => alg.id !== algId);

      if (primaryId === algId) {
        const newPrimaryId = updated[0]?.id ?? null;
        setPrimaryId(newPrimaryId);

        return updated.map((alg) => ({
          ...alg,
          primary: alg.id === newPrimaryId,
        }));
      }

      return updated;
    });
  }

  function selectPrimary(alg) {
    setPrimaryId(alg.id);

    setSheetAlgs((current) => {
      const alreadySelected = current.some(
        (sheetAlg) => sheetAlg.id === alg.id,
      );

      const updated = current.map((sheetAlg) => ({
        ...sheetAlg,
        primary: sheetAlg.id === alg.id,
      }));

      if (alreadySelected) {
        return updated;
      }

      return [
        ...updated,
        {
          id: alg.id,
          text: alg.algorithm,
          primary: true,
        },
      ];
    });
  }

  function saveAlgs() {
    const sortedAlgs = [...sheetAlgs].sort((a, b) => {
      if (a.id === primaryId) return -1;
      if (b.id === primaryId) return 1;
      return 0;
    });

    const algorithms = sortedAlgs.map((alg) => ({
      algorithm: alg.id,
      primary: alg.id === primaryId,
    }));

    onSave(algorithms);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          <h2>
            {buffer} → {firstTarget} → {secondTarget}
          </h2>

          <button type="button" className="alg-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="alg-modal__body">
          <p className="alg-modal__description">
            Save algorithms to your sheet
          </p>

          <div className="alg-modal__section-title">
            <div className="alg-modal__section-name">
              <span>BLDLab Algorithms</span>
              <strong>{databaseAlgs.length}</strong>
            </div>

            <span className="alg-modal__primary-label">Primary</span>
          </div>

          <div className="alg-modal__list">
            {databaseAlgs.map((alg) => {
              const isSelected = algIsSelected(alg.id);
              const isPrimary = primaryId === alg.id;

              return (
                <div className="alg-modal__list-row" key={alg.id}>
                  <button
                    type="button"
                    className={`alg-modal__check ${
                      isSelected ? "alg-modal__check--selected" : ""
                    }`}
                    onClick={() => toggleAlg(alg)}
                  >
                    {isSelected ? "✓" : ""}
                  </button>

                  <span className="alg-modal__alg-text">{alg.algorithm}</span>

                  <input
                    className="alg-modal__primary"
                    type="radio"
                    name="primaryAlg"
                    checked={isPrimary}
                    onChange={() => selectPrimary(alg)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="alg-modal__actions">
          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" className="button-style" onClick={saveAlgs}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
