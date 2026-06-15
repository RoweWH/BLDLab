import "./AlgModal.css";

export function AlgList({
  listAlgs = [],
  sheetAlgs = [],
  setSheetAlgs,
  primaryId,
  setPrimaryId,
  makeSheetAlg,
  getAlgId,
  renderStatus,
  onCustomMenuClick,
  isDisabled = () => false,
}) {
  function sameId(a, b) {
    return String(a) === String(b);
  }

  function getSafeAlgId(alg) {
    return getAlgId(alg) ?? alg.id ?? alg._id ?? alg.insertedId ?? null;
  }

  function algIsSelected(algId) {
    return sheetAlgs.some((sheetAlg) => sameId(sheetAlg.id, algId));
  }

  function removeAlg(algId) {
    setSheetAlgs((current) => {
      const updated = current.filter((alg) => !sameId(alg.id, algId));

      if (!sameId(primaryId, algId)) return updated;

      const newPrimaryId = updated[0]?.id ?? null;
      setPrimaryId(newPrimaryId);

      return updated.map((alg) => ({
        ...alg,
        primary: sameId(alg.id, newPrimaryId),
      }));
    });
  }

  function addAlg(alg) {
    const newAlg = makeSheetAlg(alg, true);

    setPrimaryId(newAlg.id);

    setSheetAlgs((current) => [
      ...current.map((sheetAlg) => ({
        ...sheetAlg,
        primary: false,
      })),
      newAlg,
    ]);
  }

  function toggleAlg(alg) {
    const algId = getSafeAlgId(alg);
    if (!algId || isDisabled(alg)) return;

    if (algIsSelected(algId)) removeAlg(algId);
    else addAlg(alg);
  }

  function selectPrimary(alg) {
    if (isDisabled(alg)) return;

    const newPrimaryAlg = makeSheetAlg(alg, true);
    if (!newPrimaryAlg.id) return;

    setPrimaryId(newPrimaryAlg.id);

    setSheetAlgs((current) => {
      const alreadySelected = current.some((sheetAlg) =>
        sameId(sheetAlg.id, newPrimaryAlg.id),
      );

      const updated = current.map((sheetAlg) => ({
        ...sheetAlg,
        primary: sameId(sheetAlg.id, newPrimaryAlg.id),
      }));

      return alreadySelected ? updated : [...updated, newPrimaryAlg];
    });
  }

  return (
    <div className="alg-modal__list">
      {listAlgs.map((alg, index) => {
        const algId = getSafeAlgId(alg);
        const disabled = !algId || isDisabled(alg);

        const rowKey = `${alg.source ?? alg.caseType ?? "alg"}-${
          algId ?? index
        }`;

        const isSelected = algId ? algIsSelected(algId) : false;
        const isPrimary = algId ? sameId(primaryId, algId) : false;

        return (
          <div
            className={`alg-modal__list-row ${
              renderStatus ? "alg-modal__list-row--custom" : ""
            } ${disabled ? "alg-modal__list-row--disabled" : ""}`}
            key={rowKey}
          >
            <button
              type="button"
              disabled={disabled}
              className={`alg-modal__check ${
                isSelected ? "alg-modal__check--selected" : ""
              }`}
              onClick={() => toggleAlg(alg)}
            >
              {isSelected ? "✓" : "+"}
            </button>

            <span className="alg-modal__alg-text">{alg.algorithm}</span>

            {renderStatus && renderStatus(alg)}

            {onCustomMenuClick && (
              <button
                type="button"
                className="alg-modal__menu-button"
                onClick={() => onCustomMenuClick(alg)}
              >
                ⋮
              </button>
            )}

            <input
              className="alg-modal__primary"
              type="radio"
              name="primaryAlg"
              checked={isPrimary}
              disabled={disabled}
              onChange={() => selectPrimary(alg)}
            />
          </div>
        );
      })}
    </div>
  );
}
