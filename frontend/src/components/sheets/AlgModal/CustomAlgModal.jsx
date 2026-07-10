import { useState } from "react";
import "./AlgModal.css";

function normalizeStatus(status) {
  return status?.trim().toLowerCase() ?? "private";
}

function shouldInitiallyShare(status, editing) {
  if (!editing) {
    return true;
  }

  return status === "pending";
}

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
  const editing = Boolean(editingAlg);
  const status = normalizeStatus(editingAlg?.status);
  const isPublic = status === "public";

  const [newAlgorithm, setNewAlgorithm] = useState(editingAlg?.algorithm ?? "");

  const [shareAlgorithm, setShareAlgorithm] = useState(
    shouldInitiallyShare(status, editing),
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDelete() {
    const algorithmId = editingAlg?._id ?? editingAlg?.id;

    if (!algorithmId) {
      setError("Missing algorithm id");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this algorithm?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSaving(true);

      await deleteCustomAlg(algorithmId);
      onAlgDeleted(algorithmId);
    } catch (error) {
      console.error("Failed to delete algorithm:", error);

      setError(
        error.response?.data?.message ??
          error.message ??
          "Failed to delete algorithm",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (saving || isPublic) {
      return;
    }

    setError("");

    const algorithmText = newAlgorithm.trim();

    if (!algorithmText) {
      setError("Enter an algorithm");
      return;
    }

    try {
      setSaving(true);

      const valid = await verifyAlg(
        {
          id: caseId,
          algorithms: [
            {
              algorithm: algorithmText,
            },
          ],
        },
        type,
      );

      if (!valid) {
        setError("Invalid Algorithm");
        return;
      }

      const algorithmData = {
        caseId,
        caseType: type,
        algorithm: algorithmText,
        status: shareAlgorithm ? "pending" : "private",
      };

      if (editing) {
        const algorithmId = editingAlg._id ?? editingAlg.id;

        const updatedAlgorithm = await updateCustomAlg(
          algorithmId,
          algorithmData,
        );

        onAlgUpdated(updatedAlgorithm);
        return;
      }

      const createdAlgorithm = await createNewCustomAlg(algorithmData);

      onAlgCreated(createdAlgorithm);
    } catch (error) {
      console.error("Failed to save algorithm:", error);

      setError(
        error.response?.data?.message ??
          error.message ??
          "Failed to save algorithm",
      );
    } finally {
      setSaving(false);
    }
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
              disabled={saving}
            >
              ×
            </button>
          </div>

          <div className="alg-modal__body">
            <p className="alg-modal__description">
              This algorithm is already public in the BLDLab database.
            </p>

            <p className="alg-modal__description">
              Deleting it only removes it from your personal algorithms.
            </p>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="alg-modal__actions">
            <button
              type="button"
              className="inverse-button"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </button>

            <button
              type="button"
              className="button-style"
              onClick={onClose}
              disabled={saving}
            >
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

          <button
            type="button"
            className="alg-modal__close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="alg-modal__body">
          <p className="alg-modal__description">Enter algorithm</p>

          <input
            className="custom-alg-input"
            type="text"
            value={newAlgorithm}
            onChange={(event) => setNewAlgorithm(event.target.value)}
            disabled={saving}
          />

          {error && <p className="error-message">{error}</p>}

          <label className="custom-alg-share">
            <input
              type="checkbox"
              checked={shareAlgorithm}
              onChange={(event) => setShareAlgorithm(event.target.checked)}
              disabled={saving}
            />

            {status === "rejected"
              ? "Resubmit this algorithm to the shared BLDLab database"
              : "Submit this algorithm to the shared BLDLab database"}
          </label>
        </div>

        <div className="alg-modal__actions">
          {editing && (
            <button
              type="button"
              className="inverse-button"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </button>
          )}

          <button
            type="button"
            className="inverse-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="button-style"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : editing ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
