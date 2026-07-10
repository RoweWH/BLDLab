import { useEffect, useState } from "react";

import {
  getEdgeAlgsByCaseId,
  getCornerAlgsByCaseId,
  getParityAlgsByCaseId,
  verifyAlg,
} from "../../../api/algApi";

import {
  getCustomAlgs,
  createNewCustomAlg,
  createGuestAlgorithmSubmission,
  updateGuestAlgorithmSubmission,
  deleteGuestAlgorithmSubmission,
  getGuestSubmissionStatuses,
  updateCustomAlg,
  deleteCustomAlg,
} from "../../../api/customAlgApi";

import {
  getAlgorithmsByCase,
  getPendingAlgorithmsWithSubmissions,
  updateAlgorithmSubmission,
  saveAlgorithm,
  updateAlgorithm,
  deleteAlgorithm,
} from "../../../storage/algorithmStorage";

import { AlgList } from "./AlgList";
import { CustomAlgModal } from "./CustomAlgModal";
import { TrainingCheckbox } from "../TrainingCheckbox";

import "./AlgModal.css";

function getDatabaseLoader(type) {
  if (type === "edges") {
    return getEdgeAlgsByCaseId;
  }

  if (type === "corners") {
    return getCornerAlgsByCaseId;
  }

  return getParityAlgsByCaseId;
}

function getCustomCaseId(algorithm) {
  return algorithm.caseId ?? algorithm.case?.id ?? null;
}

function getCustomBLDLabId(algorithm) {
  return (
    algorithm.BLDLabId ??
    algorithm.bldlabAlgorithmId ??
    null
  );
}

function getCustomAlgId(algorithm) {
  return algorithm._id ?? algorithm.id;
}

function getStatus(algorithm) {
  return algorithm?.status?.trim().toLowerCase() ?? "private";
}

function isLoggedIn() {
  return Boolean(sessionStorage.getItem("User"));
}

function getResponseData(response) {
  return response?.data ?? response;
}

export function AlgModal({
  cell,
  type,
  onClose,
  onSave,
  onToggleTraining,
}) {
  const loggedIn = isLoggedIn();

  const [databaseAlgs, setDatabaseAlgs] = useState([]);
  const [customAlgs, setCustomAlgs] = useState([]);
  const [sheetAlgs, setSheetAlgs] = useState(
    cell.algorithms ?? [],
  );

  const [memoryData, setMemoryData] = useState(
    cell.memoryData ?? {
      letters: "",
      word: "",
    },
  );

  const [primaryId, setPrimaryId] = useState(
    cell.algorithms?.find((algorithm) => algorithm.primary)
      ?.id ?? null,
  );

  const [showCustomAlgModal, setShowCustomAlgModal] =
    useState(false);

  const [editingCustomAlg, setEditingCustomAlg] =
    useState(null);

  const caseId = cell.id;
  const caseInfo = cell.caseInfo ?? `Case #${caseId}`;

  useEffect(() => {
    async function loadDatabaseAlgorithms() {
      try {
        const loadAlgorithms = getDatabaseLoader(type);
        const response = await loadAlgorithms(caseId);

        setDatabaseAlgs(response.data ?? []);
      } catch (error) {
        console.error(
          "Failed to load database algorithms:",
          error,
        );

        setDatabaseAlgs([]);
      }
    }

    if (caseId) {
      loadDatabaseAlgorithms();
    }
  }, [caseId, type]);

  useEffect(() => {
    async function syncGuestSubmissions() {
      const submittedAlgorithms =
        await getPendingAlgorithmsWithSubmissions();

      if (submittedAlgorithms.length === 0) {
        return;
      }

      const submissionIds = submittedAlgorithms.map(
        (algorithm) => algorithm.submissionId,
      );

      const response =
        await getGuestSubmissionStatuses(submissionIds);

      for (const submission of response.data ?? []) {
        const localAlgorithm = submittedAlgorithms.find(
          (algorithm) =>
            String(algorithm.submissionId) ===
            String(submission.submissionId),
        );

        if (!localAlgorithm) {
          continue;
        }

        await updateAlgorithmSubmission(
          localAlgorithm.id,
          submission,
        );
      }
    }

    async function loadCustomAlgorithms() {
      try {
        if (loggedIn) {
          const response = await getCustomAlgs();

          const matchingAlgorithms = (
            response.data ?? []
          ).filter(
            (algorithm) =>
              algorithm.caseType === type &&
              String(getCustomCaseId(algorithm)) ===
                String(caseId),
          );

          setCustomAlgs(matchingAlgorithms);
          return;
        }

        await syncGuestSubmissions();

        const localAlgorithms =
          await getAlgorithmsByCase(type, caseId);

        setCustomAlgs(localAlgorithms);
      } catch (error) {
        console.error(
          "Failed to load custom algorithms:",
          error,
        );

        setCustomAlgs([]);
      }
    }

    if (caseId) {
      loadCustomAlgorithms();
    }
  }, [caseId, type, loggedIn]);

  const customBLDLabIds = new Set(
    customAlgs
      .map(getCustomBLDLabId)
      .filter((id) => id != null)
      .map(String),
  );

  const visibleDatabaseAlgs = databaseAlgs.filter(
    (algorithm) =>
      !customBLDLabIds.has(String(algorithm.id)),
  );

  function findCustomAlgorithm(id) {
    return customAlgs.find(
      (algorithm) =>
        String(getCustomAlgId(algorithm)) === String(id),
    );
  }

  function updateMemoryField(field, value) {
    setMemoryData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * Logged-in persistence
   */

  async function createUserAlgorithm(algorithmData) {
    const response =
      await createNewCustomAlg(algorithmData);

    return getResponseData(response);
  }

  async function updateUserAlgorithm(
    id,
    algorithmData,
  ) {
    const response = await updateCustomAlg(
      id,
      algorithmData,
    );

    return getResponseData(response);
  }

  async function deleteUserAlgorithm(id) {
    await deleteCustomAlg(id);
  }

  /*
   * Guest persistence
   */

  async function createGuestAlgorithm(algorithmData) {
    if (algorithmData.status === "private") {
      return saveAlgorithm(algorithmData);
    }

    const submissionResponse =
      await createGuestAlgorithmSubmission(
        algorithmData,
      );

    const submission =
      getResponseData(submissionResponse);

    return saveAlgorithm({
      ...algorithmData,
      submissionId: submission.submissionId,
      submissionKey: submission.submissionKey,
      status: submission.status,
      BLDLabId: submission.BLDLabId ?? null,
      reviewedDate: submission.reviewedDate ?? null,
    });
  }

  async function updateGuestAlgorithm(
    id,
    algorithmData,
  ) {
    const existingAlgorithm = findCustomAlgorithm(id);

    if (!existingAlgorithm) {
      throw new Error("Algorithm was not found");
    }

    if (getStatus(existingAlgorithm) === "public") {
      throw new Error(
        "Public algorithms cannot be edited",
      );
    }

    /*
     * A guest algorithm without a submission remains entirely
     * local unless it is now being submitted.
     */
    if (!existingAlgorithm.submissionId) {
      if (algorithmData.status === "private") {
        return updateAlgorithm(id, algorithmData);
      }

      const submissionResponse =
        await createGuestAlgorithmSubmission(
          algorithmData,
        );

      const submission =
        getResponseData(submissionResponse);

      return updateAlgorithm(id, {
        ...algorithmData,
        submissionId: submission.submissionId,
        submissionKey: submission.submissionKey,
        status: submission.status,
        BLDLabId: submission.BLDLabId ?? null,
        reviewedDate:
          submission.reviewedDate ?? null,
      });
    }

    if (!existingAlgorithm.submissionKey) {
      throw new Error(
        "This guest submission is missing its ownership key",
      );
    }

    /*
     * Once a Mongo submission exists, private/pending/rejected
     * transitions update that same record.
     */
    const submissionResponse =
      await updateGuestAlgorithmSubmission(
        existingAlgorithm.submissionId,
        existingAlgorithm.submissionKey,
        algorithmData,
      );

    const submission =
      getResponseData(submissionResponse);

    return updateAlgorithm(id, {
      ...algorithmData,
      status: submission.status,
      BLDLabId: submission.BLDLabId ?? null,
      reviewedDate:
        submission.reviewedDate ?? null,
    });
  }

  async function deleteGuestAlgorithm(id) {
    const existingAlgorithm = findCustomAlgorithm(id);

    if (!existingAlgorithm) {
      throw new Error("Algorithm was not found");
    }

    /*
     * A public submission stays in Mongo/BLDLab. We only delete
     * the guest's IndexedDB copy.
     */
    if (getStatus(existingAlgorithm) === "public") {
      await deleteAlgorithm(id);
      return;
    }

    if (
      existingAlgorithm.submissionId &&
      existingAlgorithm.submissionKey
    ) {
      await deleteGuestAlgorithmSubmission(
        existingAlgorithm.submissionId,
        existingAlgorithm.submissionKey,
      );
    }

    await deleteAlgorithm(id);
  }

  /*
   * Shared operations used by CustomAlgModal
   */

  async function createCustomAlgorithm(algorithmData) {
    return loggedIn
      ? createUserAlgorithm(algorithmData)
      : createGuestAlgorithm(algorithmData);
  }

  async function updateExistingCustomAlgorithm(
    id,
    algorithmData,
  ) {
    return loggedIn
      ? updateUserAlgorithm(id, algorithmData)
      : updateGuestAlgorithm(id, algorithmData);
  }

  async function deleteExistingCustomAlgorithm(id) {
    return loggedIn
      ? deleteUserAlgorithm(id)
      : deleteGuestAlgorithm(id);
  }

  function handleCustomAlgCreated(newAlgorithm) {
    setCustomAlgs((current) => [
      ...current,
      newAlgorithm,
    ]);

    const newAlgorithmId =
      getCustomAlgId(newAlgorithm);

    const newSheetAlgorithm = {
      id: newAlgorithmId,
      displayText: newAlgorithm.algorithm,
      primary: true,
      source: "custom",
      last50: [],
    };

    setPrimaryId(newAlgorithmId);

    setSheetAlgs((current) => [
      ...current.map((algorithm) => ({
        ...algorithm,
        primary: false,
      })),
      newSheetAlgorithm,
    ]);

    setShowCustomAlgModal(false);
  }

  function handleCustomAlgUpdated(updatedAlgorithm) {
    const updatedAlgorithmId =
      getCustomAlgId(updatedAlgorithm);

    setCustomAlgs((current) =>
      current.map((algorithm) =>
        String(getCustomAlgId(algorithm)) ===
        String(updatedAlgorithmId)
          ? updatedAlgorithm
          : algorithm,
      ),
    );

    setSheetAlgs((current) =>
      current.map((algorithm) =>
        String(algorithm.id) ===
        String(updatedAlgorithmId)
          ? {
              ...algorithm,
              displayText:
                updatedAlgorithm.algorithm,
            }
          : algorithm,
      ),
    );

    setEditingCustomAlg(null);
    setShowCustomAlgModal(false);
  }

  function handleCustomAlgDeleted(deletedAlgorithmId) {
    setCustomAlgs((current) =>
      current.filter(
        (algorithm) =>
          String(getCustomAlgId(algorithm)) !==
          String(deletedAlgorithmId),
      ),
    );

    setSheetAlgs((current) => {
      const updatedAlgorithms = current.filter(
        (algorithm) =>
          String(algorithm.id) !==
          String(deletedAlgorithmId),
      );

      const deletedWasPrimary =
        String(primaryId) ===
        String(deletedAlgorithmId);

      const newPrimaryId = deletedWasPrimary
        ? updatedAlgorithms[0]?.id ?? null
        : primaryId;

      setPrimaryId(newPrimaryId);

      const algorithmsWithPrimary =
        updatedAlgorithms.map((algorithm) => ({
          ...algorithm,
          primary:
            String(algorithm.id) ===
            String(newPrimaryId),
        }));

      onSave(algorithmsWithPrimary, memoryData);

      return algorithmsWithPrimary;
    });

    setEditingCustomAlg(null);
    setShowCustomAlgModal(false);
  }

  function closeCustomAlgModal() {
    setShowCustomAlgModal(false);
    setEditingCustomAlg(null);
  }

  function openNewCustomAlgModal() {
    setEditingCustomAlg(null);
    setShowCustomAlgModal(true);
  }

  function openEditCustomAlgModal(algorithm) {
    setEditingCustomAlg(algorithm);
    setShowCustomAlgModal(true);
  }

  function saveAlgs() {
    const sortedAlgorithms = [...sheetAlgs].sort(
      (first, second) => {
        if (String(first.id) === String(primaryId)) {
          return -1;
        }

        if (
          String(second.id) === String(primaryId)
        ) {
          return 1;
        }

        return 0;
      },
    );

    const algorithms = sortedAlgorithms.map(
      (algorithm) => ({
        ...algorithm,
        primary:
          String(algorithm.id) ===
          String(primaryId),
      }),
    );

    onSave(algorithms, memoryData);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="alg-modal">
        <div className="alg-modal__header">
          <div className="alg-modal__case-heading">
            <h2>{caseInfo}</h2>

            <div className="alg-modal__memory-fields">
              <label className="alg-modal__memory-field">
                <span>Letters</span>

                <input
                  value={memoryData.letters ?? ""}
                  onChange={(event) =>
                    updateMemoryField(
                      "letters",
                      event.target.value.toUpperCase(),
                    )
                  }
                />
              </label>

              <label className="alg-modal__memory-field">
                <span>Word</span>

                <input
                  value={memoryData.word ?? ""}
                  onChange={(event) =>
                    updateMemoryField(
                      "word",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <TrainingCheckbox
              checked={cell.training === true}
              title="Train this case"
              className="alg-modal__training-toggle"
              onChange={(checked) =>
                onToggleTraining(
                  cell.columnPiece,
                  cell.id,
                  checked,
                )
              }
            />
          </div>

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
            Save algorithms to your sheet
          </p>

          <div className="alg-modal__section-title">
            <div className="alg-modal__section-name">
              <span>BLDLab Algorithms</span>
              <strong>
                {visibleDatabaseAlgs.length}
              </strong>
            </div>

            {visibleDatabaseAlgs.length !== 0 && (
              <span className="alg-modal__primary-label">
                Primary
              </span>
            )}
          </div>

          <AlgList
            listAlgs={visibleDatabaseAlgs}
            sheetAlgs={sheetAlgs}
            setSheetAlgs={setSheetAlgs}
            primaryId={primaryId}
            setPrimaryId={setPrimaryId}
            makeSheetAlg={(algorithm, primary) => ({
              id: algorithm.id,
              displayText: algorithm.algorithm,
              primary,
              source: "bldlab",
            })}
            getAlgId={(algorithm) => algorithm.id}
          />
        </div>

        {customAlgs.length !== 0 && (
          <div className="alg-modal__body">
            <div className="alg-modal__section-title">
              <div className="alg-modal__section-name">
                <span>Your Algorithms</span>
                <strong>{customAlgs.length}</strong>
              </div>

              <span className="alg-modal__primary-label">
                Primary
              </span>
            </div>

            <AlgList
              listAlgs={customAlgs}
              sheetAlgs={sheetAlgs}
              setSheetAlgs={setSheetAlgs}
              primaryId={primaryId}
              setPrimaryId={setPrimaryId}
              makeSheetAlg={(algorithm, primary) => ({
                id: getCustomAlgId(algorithm),
                displayText: algorithm.algorithm,
                primary,
                source: "custom",
              })}
              getAlgId={getCustomAlgId}
              renderStatus={(algorithm) =>
                algorithm.status ? (
                  <span
                    className={`alg-status alg-status--${algorithm.status}`}
                  >
                    {algorithm.status}
                  </span>
                ) : null
              }
              onCustomMenuClick={
                openEditCustomAlgModal
              }
            />
          </div>
        )}

        <div className="alg-modal__actions">
          <button
            type="button"
            className="inverse-button"
            onClick={openNewCustomAlgModal}
          >
            Add Algorithm
          </button>

          <button
            type="button"
            className="inverse-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="button-style"
            onClick={saveAlgs}
          >
            Save
          </button>
        </div>

        {showCustomAlgModal && (
          <CustomAlgModal
            caseId={caseId}
            type={type}
            editingAlg={editingCustomAlg}
            verifyAlg={verifyAlg}
            createNewCustomAlg={
              createCustomAlgorithm
            }
            updateCustomAlg={
              updateExistingCustomAlgorithm
            }
            deleteCustomAlg={
              deleteExistingCustomAlgorithm
            }
            onClose={closeCustomAlgModal}
            onAlgCreated={
              handleCustomAlgCreated
            }
            onAlgUpdated={
              handleCustomAlgUpdated
            }
            onAlgDeleted={
              handleCustomAlgDeleted
            }
          />
        )}
      </div>
    </div>
  );
}