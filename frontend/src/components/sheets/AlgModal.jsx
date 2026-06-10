export function AlgModal({ cell, type, onClose }) {
  if (!cell) return null;

  const algorithms = cell.algorithms ?? [];

  return (
    <div className="modal-backdrop">
      <div className="sheet-modal">
        <div className="sheet-modal__header">
          <h2>Edit Algorithms</h2>

          <button type="button" className="modal-x" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-section">
          <div>
            <strong>Case:</strong> {cell.piece}
          </div>

          <div>
            <strong>Type:</strong> {type}
          </div>
        </div>

        <div className="modal-section">
          {algorithms.length === 0 ? (
            <p>No algorithms added.</p>
          ) : (
            algorithms.map((alg, index) => (
              <div key={alg.id ?? index}>
                <strong>
                  {alg.primary ? "Primary" : `Algorithm ${index + 1}`}
                </strong>

                <p>{alg.algorithm}</p>
              </div>
            ))
          )}
        </div>

        <div className="sheet-modal__actions">
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
