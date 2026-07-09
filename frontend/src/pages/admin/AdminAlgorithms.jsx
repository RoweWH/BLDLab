import { useEffect, useState } from "react";
import {
  getPendingAlgorithms,
  updateAdminAlgorithmStatus,
} from "../../api/adminApi";
import {
  insertEdgeAlg,
  insertCornerAlg,
  insertParityAlg,
} from "../../api/algApi";
import "./Admin.css";

function getAlgorithmCreator(type) {
  if (type === "edges") return insertEdgeAlg;
  if (type === "corners") return insertCornerAlg;
  if (["parity", "2e2c", "ltct", "t2c"].includes(type)) return insertParityAlg;

  throw new Error(`Unknown algorithm type: ${type}`);
}

function buildSubmission(alg) {
  return {
    id: alg.caseId,
    algorithms: [{ algorithm: alg.algorithm }],
  };
}

export function AdminAlgorithms() {
  const [pendingAlgs, setPendingAlgs] = useState([]);
  const [error, setError] = useState("");
  const [approvingAll, setApprovingAll] = useState(false);

  useEffect(() => {
    loadPendingAlgorithms();
  }, []);

  async function loadPendingAlgorithms() {
    try {
      setError("");
      const response = await getPendingAlgorithms();
      setPendingAlgs(response.data ?? []);
    } catch (error) {
      console.error("Failed to load pending algorithms:", error);
      setError("Failed to load pending algorithms");
    }
  }

  async function approveAlgorithm(alg) {
    const insertAlgorithm = getAlgorithmCreator(alg.caseType);
    const submission = buildSubmission(alg);
    const response = await insertAlgorithm(submission);
    const result = response.data ?? response;

    const databaseAlgorithmId = result?.id ?? result?.Id;

    if (!databaseAlgorithmId) {
      throw new Error("Database insert did not return a new algorithm id.");
    }

    await updateAdminAlgorithmStatus(alg._id, "public", databaseAlgorithmId);
    removeFromPending(alg._id);
  }

  async function handleApproveAlgorithm(alg) {
    try {
      setError("");
      await approveAlgorithm(alg);
    } catch (error) {
      console.error("Failed to approve algorithm:", error);
      setError(
        error.response?.data?.message ??
          error.response?.data?.Message ??
          error.message ??
          "Failed to approve algorithm",
      );
    }
  }

  async function approveAllAlgorithms() {
    setApprovingAll(true);
    setError("");

    try {
      for (const alg of pendingAlgs) {
        await approveAlgorithm(alg);
      }
    } catch (error) {
      console.error("Failed to approve all algorithms:", error);
      setError(
        error.response?.data?.message ??
          error.response?.data?.Message ??
          error.message ??
          "Failed to approve all algorithms",
      );
    } finally {
      setApprovingAll(false);
    }
  }

  async function rejectAlgorithm(alg) {
    try {
      setError("");
      await updateAdminAlgorithmStatus(alg._id, "rejected");
      removeFromPending(alg._id);
    } catch (error) {
      console.error("Failed to reject algorithm:", error);
      setError("Failed to reject algorithm");
    }
  }

  function removeFromPending(id) {
    setPendingAlgs((current) =>
      current.filter((alg) => String(alg._id) !== String(id)),
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-page-header">
        <h1>Pending Algorithms</h1>

        {pendingAlgs.length > 0 && (
          <button
            type="button"
            className="button-style"
            onClick={approveAllAlgorithms}
            disabled={approvingAll}
          >
            {approvingAll ? "Approving..." : "Approve All"}
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {!error && pendingAlgs.length === 0 && (
        <div className="admin-empty-state">No algorithms pending approval.</div>
      )}

      <div className="admin-alg-list">
        {pendingAlgs.map((alg) => (
          <div className="admin-alg-card" key={alg._id}>
            <div className="admin-alg-card__meta">
              <span className="admin-alg-card__type">{alg.caseType}</span>
              <span className="admin-alg-card__case">Case #{alg.caseId}</span>
            </div>

            <div className="admin-alg-card__algorithm">{alg.algorithm}</div>

            <span className="admin-status admin-status--pending">Pending</span>

            <div className="admin-alg-card__actions">
              <button
                type="button"
                className="button-style"
                onClick={() => handleApproveAlgorithm(alg)}
              >
                Approve
              </button>

              <button
                type="button"
                className="button-style danger-button"
                onClick={() => rejectAlgorithm(alg)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
