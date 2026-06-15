import "./AlgModal.css";
import { useState } from "react";

export function CustomAlgModal({
  caseId,
  type,
  editingAlg,
  verifyAlg,
  createNewCustomAlg,
  updateCustomAlg,
  deleteCustomAlg,
  onAlgCreated,
  onAlgUpdated,
  onClose,
  onAlgDeleted,
}) {
  const editing = !!editingAlg;
  const isPublic = editingAlg?.status?.trim().toLowerCase() === "public";

  const [newAlgorithm, setNewAlgorithm] = useState(editingAlg?.algorithm ?? "");
  const [error, setError] = useState("");
  const [shareAlgorithm, setShareAlgorithm] = useState(
    editing ? editingAlg.status !== "private" : true,
  );

  async function deleteAlgorithm() {
    const algId = editingAlg?._id ?? editingAlg?.id;

    if (!algId) {
      setError("Missing algorithm id");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this algorithm?",
    );

    if (!confirmed) return;

    try {
      await deleteCustomAlg(algId);
      onAlgDeleted(algId);
    } catch (error) {
      console.error("Failed to delete algorithm:", error);
      setError("Failed to delete algorithm");
    }
  }

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

    const algData = {
      caseId,
      caseType: type,
      algorithm: newAlgorithm,
      status: shareAlgorithm ? "pending" : "private",
    };

    if (editing) {
      const updatedAlg = {
        ...editingAlg,
        ...algData,
      };

      await updateCustomAlg(editingAlg._id, updatedAlg);
      onAlgUpdated(updatedAlg);
      return;
    }

    const response = await createNewCustomAlg(algData);
    onAlgCreated(response.data);
  }

  if (isPublic) {
    return (
      <div className="modal-backdrop">
        <div className="alg-modal">
          <div className="alg-modal__header">
            <h2>Public Algorithm</h2>

            <button
              type="button"
              className="alg-modal__close"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="alg-modal__body">
            <p className="alg-modal__description">
              This algorithm has already been added to the shared BLDLab
              database. You can remove it from your personal algorithms, but it
              will remain available in the public database.
            </p>

            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="alg-modal__actions">
            <button
              type="button"
              className="inverse-button"
              onClick={deleteAlgorithm}
            >
              Delete
            </button>

            <button type="button" className="button-style" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          <h2>{editing ? "Edit Algorithm" : "Add Algorithm"}</h2>

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
          {editing && (
            <button
              type="button"
              className="inverse-button"
              onClick={deleteAlgorithm}
            >
              Delete
            </button>
          )}

          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="button-style"
            onClick={submitAlgorithm}
          >
            {editing ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
