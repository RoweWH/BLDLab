import { useEffect, useState } from "react";
import {
  getEdgeAlgs,
  getCornerAlgs,
  getEdgeAlgById,
  getCornerAlgById,
  getParityAlgById,
} from "../../api/algApi";
import "./AlgModal.css";

export function AlgModal({ cell, columnPiece, options, type, onClose }) {
  const [databaseAlgs, setDatabaseAlgs] = useState([]);
  const [sheetAlgs, setSheetAlgs] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);

  if (!cell) return null;

  const buffer = options?.buffer ?? options?.headerInfo?.[0];
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

  function toggleAlg(alg) {
    const alreadyAdded = sheetAlgs.some((sheetAlg) => sheetAlg.id === alg.id);

    if (alreadyAdded) {
      removeAlg(alg.id);
      return;
    }

    const newAlg = {
      id: alg.id,
      text: alg.algorithm,
      primary: sheetAlgs.length === 0,
    };

    setSheetAlgs((current) => [...current, newAlg]);

    if (sheetAlgs.length === 0) {
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

  function selectPrimary(algId) {
    setPrimaryId(algId);

    setSheetAlgs((current) =>
      current.map((alg) => ({
        ...alg,
        primary: alg.id === algId,
      })),
    );
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

        <div className="alg-modal__content">
          <div className="alg-modal__box">
            <h3>Database</h3>

            {databaseAlgs.map((alg) => {
              const isAdded = sheetAlgs.some(
                (sheetAlg) => sheetAlg.id === alg.id,
              );

              return (
                <div className="alg-modal__row" key={alg.id}>
                  <button
                    type="button"
                    className={isAdded ? "alg-modal__added" : ""}
                    onClick={() => toggleAlg(alg)}
                  >
                    {isAdded ? "✓" : "+"}
                  </button>

                  <span>{alg.algorithm}</span>
                </div>
              );
            })}
          </div>

          <div className="alg-modal__box">
            <div className="alg-modal__box-header">
              <h3>Sheet</h3>
              <span>Primary</span>
            </div>

            {sheetAlgs.length === 0 ? (
              <p className="alg-modal__empty">No algorithms selected.</p>
            ) : (
              sheetAlgs.map((alg) => (
                <div
                  className="alg-modal__row alg-modal__row--sheet"
                  key={alg.id}
                >
                  <button type="button" onClick={() => removeAlg(alg.id)}>
                    -
                  </button>

                  <span>{alg.text}</span>

                  <input
                    type="radio"
                    name="primaryAlg"
                    checked={primaryId === alg.id}
                    onChange={() => selectPrimary(alg.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="alg-modal__actions">
          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" className="button-style">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
