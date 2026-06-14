import "./AlgModal.css";
import { useState } from "react";

export function CustomAlgModal({
  caseId,
  type,
  verifyAlg,
  createNewCustomAlg,
  onAlgCreated,
  onClose,
}) {
  const [newAlgorithm, setNewAlgorithm] = useState("");
  const [error, setError] = useState("");
  const [shareAlgorithm, setShareAlgorithm] = useState(true);

  async function submitAlgorithm() {
    setError("");

    const valid = await verifyAlg(
      {
        id: caseId,
        algorithms: [
          {
            algorithm: newAlgorithm,
          },
        ],
      },
      type,
    );

    if (!valid) {
      setError("Invalid Algorithm");
      return;
    }

    const response = await createNewCustomAlg({
      caseId,
      caseType: type,
      algorithm: newAlgorithm,
      status: shareAlgorithm ? "pending" : "private",
    });

    onAlgCreated(response.data);
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          <h2>Add Algorithm</h2>

          <button type="button" className="alg-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="alg-modal__body">
          <p className="alg-modal__description">Enter algorithm</p>

          <input
            className="custom-alg-input"
            type="text"
            value={newAlgorithm}
            onChange={(e) => setNewAlgorithm(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <label className="custom-alg-share">
            <input
              type="checkbox"
              checked={shareAlgorithm}
              onChange={(e) => setShareAlgorithm(e.target.checked)}
            />
            Submit this algorithm to the shared BLDLab database
          </label>
        </div>

        <div className="alg-modal__actions">
          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="button-style"
            onClick={submitAlgorithm}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
