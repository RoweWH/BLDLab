import { useEffect, useState } from "react";
import {
  getEdgeAlgsByCaseId,
  getCornerAlgsByCaseId,
  getParityAlgsByCaseId,
  verifyAlg,
} from "../../../api/algApi";
import { getCustomAlgs, createNewCustomAlg } from "../../../api/customAlgApi";
import { AlgList } from "./AlgList";
import "./AlgModal.css";
import { CustomAlgModal } from "./CustomAlgModal";

function getDatabaseLoader(type) {
  if (type === "edges") return getEdgeAlgsByCaseId;
  if (type === "corners") return getCornerAlgsByCaseId;
  return getParityAlgsByCaseId;
}

function getCustomCaseId(alg) {
  return alg.caseId ?? alg.case?.id ?? null;
}

export function AlgModal({ cell, type, onClose, onSave }) {
  const [databaseAlgs, setDatabaseAlgs] = useState([]);
  const [customAlgs, setCustomAlgs] = useState([]);
  const [sheetAlgs, setSheetAlgs] = useState(cell.algorithms ?? []);
  const [primaryId, setPrimaryId] = useState(
    cell.algorithms?.find((alg) => alg.primary)?.id ?? null,
  );
  const [showCustomAlgModal, setShowCustomAlgModal] = useState(false);

  const caseId = cell.id;
  const caseInfo = cell.caseInfo ?? `Case #${caseId}`;

  useEffect(() => {
    async function loadDatabaseAlgs() {
      try {
        const loadAlgs = getDatabaseLoader(type);
        const response = await loadAlgs(caseId);

        setDatabaseAlgs(response.data ?? []);
      } catch (error) {
        console.error("Failed to load database algs:", error);
        setDatabaseAlgs([]);
      }
    }

    if (caseId) {
      loadDatabaseAlgs();
    }
  }, [caseId, type]);

  useEffect(() => {
    async function loadCustomAlgs() {
      try {
        const response = await getCustomAlgs();

        const matchingAlgs = response.data.filter(
          (alg) =>
            alg.caseType === type &&
            String(getCustomCaseId(alg)) === String(caseId),
        );

        setCustomAlgs(matchingAlgs);
      } catch (error) {
        console.error("Failed to load custom algs:", error);
        setCustomAlgs([]);
      }
    }

    if (caseId) {
      loadCustomAlgs();
    }
  }, [caseId, type]);

  function handleCustomAlgCreated(newAlg) {
    setCustomAlgs((current) => [...current, newAlg]);

    const newSheetAlg = {
      id: newAlg._id,
      displayText: newAlg.algorithm,
      primary: true,
      source: "custom",
    };

    setPrimaryId(newAlg._id);

    setSheetAlgs((current) => [
      ...current.map((alg) => ({
        ...alg,
        primary: false,
      })),
      newSheetAlg,
    ]);

    setShowCustomAlgModal(false);
  }
  function saveAlgs() {
    const sortedAlgs = [...sheetAlgs].sort((a, b) => {
      if (String(a.id) === String(primaryId)) return -1;
      if (String(b.id) === String(primaryId)) return 1;
      return 0;
    });

    const algorithms = sortedAlgs.map((alg) => ({
      ...alg,
      primary: String(alg.id) === String(primaryId),
    }));

    onSave(algorithms);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          <h2>{caseInfo}</h2>

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

          <AlgList
            listAlgs={databaseAlgs}
            sheetAlgs={sheetAlgs}
            setSheetAlgs={setSheetAlgs}
            primaryId={primaryId}
            setPrimaryId={setPrimaryId}
            makeSheetAlg={(alg, primary) => ({
              id: alg.id,
              displayText: alg.algorithm,
              primary,
              source: "bldlab",
            })}
            getAlgId={(alg) => alg.id}
          />
        </div>

        <div className="alg-modal__body">
          <div className="alg-modal__section-title">
            <div className="alg-modal__section-name">
              <span>Your Algorithms</span>
              <strong>{customAlgs.length}</strong>
            </div>

            <span className="alg-modal__primary-label">Primary</span>
          </div>

          <AlgList
            listAlgs={customAlgs}
            sheetAlgs={sheetAlgs}
            setSheetAlgs={setSheetAlgs}
            primaryId={primaryId}
            setPrimaryId={setPrimaryId}
            makeSheetAlg={(alg, primary) => ({
              id: alg._id,
              displayText: alg.algorithm,
              primary,
              source: "custom",
            })}
            getAlgId={(alg) => alg._id}
            renderStatus={(alg) => (
              <span className={`alg-status alg-status--${alg.status}`}>
                {alg.status}
              </span>
            )}
          />
        </div>

        <div className="alg-modal__actions">
          <button
            type="button"
            className="inverse-button"
            onClick={() => setShowCustomAlgModal(true)}
          >
            Add Algorithm
          </button>

          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" className="button-style" onClick={saveAlgs}>
            Save
          </button>
        </div>

        {showCustomAlgModal && (
          <CustomAlgModal
            caseId={caseId}
            type={type}
            verifyAlg={verifyAlg}
            createNewCustomAlg={createNewCustomAlg}
            onClose={() => setShowCustomAlgModal(false)}
            onAlgCreated={handleCustomAlgCreated}
          />
        )}
      </div>
    </div>
  );
}
