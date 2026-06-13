import { useEffect, useState } from "react";
import { getEdgeAlgs, getCornerAlgs, getParityAlgs } from "../../api/algApi";
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
  const firstEdge = options?.edgeSwap?.[0];
  const secondEdge = options?.edgeSwap?.[1];
  const twist = cell.twistPiece;
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
        } else if (type === "2e2c") {
          response = await getParityAlgs(
            firstEdge,
            secondEdge,
            firstTarget,
            secondTarget,
            null,
          );
        } else if (type === "ltct") {
          response = await getParityAlgs(
            firstEdge,
            secondEdge,
            buffer,
            firstTarget,
            secondTarget,
          );
        } else if (type === "t2c") {
          response = await getParityAlgs(
            firstEdge,
            secondEdge,
            firstTarget,
            secondTarget,
            twist,
          );
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
  }, [type, buffer, firstTarget, secondTarget, firstEdge, secondEdge, twist]);

  useEffect(() => {
    const storedAlgs = cell.algorithms ?? [];

    const loadedAlgs = storedAlgs.map((storedAlg) => ({
      id: storedAlg.algorithmId,
      text: storedAlg.displayText,
      primary: storedAlg.primary,
      source: storedAlg.source,
      status: storedAlg.status,
    }));

    setSheetAlgs(loadedAlgs);

    const primary = loadedAlgs.find((alg) => alg.primary);
    setPrimaryId(primary?.id ?? null);
  }, [cell]);

  function algIsSelected(algId) {
    return sheetAlgs.some((sheetAlg) => sheetAlg.id === algId);
  }

  function makeBldlabAlg(alg, primary = false) {
    return {
      id: alg.id,
      text: alg.algorithm,
      primary,
      source: "bldlab",
      status: "public",
    };
  }

  function toggleAlg(alg) {
    if (algIsSelected(alg.id)) {
      removeAlg(alg.id);
      return;
    }

    const newAlg = makeBldlabAlg(alg, true);

    setSheetAlgs((current) => [
      ...current.map((sheetAlg) => ({
        ...sheetAlg,
        primary: false,
      })),
      newAlg,
    ]);

    setPrimaryId(alg.id);
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

      return [...updated, makeBldlabAlg(alg, true)];
    });
  }

  function saveAlgs() {
    const sortedAlgs = [...sheetAlgs].sort((a, b) => {
      if (a.id === primaryId) return -1;
      if (b.id === primaryId) return 1;
      return 0;
    });

    const algorithms = sortedAlgs.map((alg) => ({
      algorithmId: alg.id,
      displayText: alg.text,
      primary: alg.id === primaryId,
      source: alg.source,
      status: alg.status,
    }));

    onSave(algorithms);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          {type === "edges" || type === "corners" ? (
            <h2>
              {buffer} → {firstTarget} → {secondTarget}
            </h2>
          ) : type === "2e2c" ? (
            <h2>
              {firstEdge}/{secondEdge} + {firstTarget} → {secondTarget}
            </h2>
          ) : type === "ltct" ? (
            <h2>
              {firstEdge}/{secondEdge} + {buffer} → {firstTarget}({secondTarget}
              )
            </h2>
          ) : type === "t2c" ? (
            <h2>
              {firstEdge}/{secondEdge} + {firstTarget} → {secondTarget}({twist})
            </h2>
          ) : null}

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
