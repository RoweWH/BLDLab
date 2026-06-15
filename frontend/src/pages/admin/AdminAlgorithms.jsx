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

  return insertParityAlg;
}

export function AdminAlgorithms() {
  const [pendingAlgs, setPendingAlgs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPendingAlgorithms();
  }, []);

  async function loadPendingAlgorithms() {
    try {
      const response = await getPendingAlgorithms();
      setPendingAlgs(response.data ?? []);
    } catch (error) {
      console.error("Failed to load pending algorithms:", error);
      setError("Failed to load pending algorithms");
    }
  }

  async function approveAlgorithm(alg) {
    try {
      const insertAlgorithm = getAlgorithmCreator(alg.caseType);

      try {
        await insertAlgorithm({
          id: alg.caseId,
          algorithms: [
            {
              algorithm: alg.algorithm,
            },
          ],
        });
      } catch (error) {
        console.warn(
          "Failed adding to public database. Probably duplicate:",
          error,
        );
      }

      await updateAdminAlgorithmStatus(alg._id, "public");
      removeFromPending(alg._id);
    } catch (error) {
      console.error("Failed to approve algorithm:", error);
      setError("Failed to approve algorithm");
    }
  }

  async function rejectAlgorithm(alg) {
    try {
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
    <div className="page">
      <div className="admin-page-header">
        <h1>Admin Algorithms</h1>

        <p>
          Review submitted algorithms before adding them to the shared database.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!error && pendingAlgs.length === 0 && (
        <div className="admin-empty-state">No algorithms pending approval.</div>
      )}

      <div className="admin-alg-list">
        {pendingAlgs.map((alg) => (
          <div className="admin-alg-card" key={alg._id}>
            <div className="admin-alg-card__top">
              <span className="admin-alg-card__type">{alg.caseType}</span>

              <span className="admin-alg-card__case">Case #{alg.caseId}</span>

              <span className="admin-status admin-status--pending">
                pending
              </span>
            </div>

            <div className="admin-alg-card__algorithm">{alg.algorithm}</div>

            <div className="admin-alg-card__actions">
              <button
                type="button"
                className="button-style"
                onClick={() => approveAlgorithm(alg)}
              >
                Approve
              </button>

              <button
                type="button"
                className="button-style admin-reject-button"
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
