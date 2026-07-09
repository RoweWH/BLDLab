import { useState } from "react";
import "./SheetActionsMenu.css";

export function SheetActionsMenu({ onDelete, onExportCsv }) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleDeleteClick() {
    setOpen(false);
    setConfirmingDelete(true);
  }

  return (
    <div className="sheet-actions">
      <button
        type="button"
        className="sheet-actions__trigger"
        aria-label="Sheet actions"
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </button>

      {open && (
        <div className="sheet-actions__menu">
          <button type="button" onClick={onExportCsv}>
            Export CSV
          </button>

          <button
            type="button"
            className="sheet-actions__delete"
            onClick={handleDeleteClick}
          >
            Delete
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div className="sheet-delete-backdrop">
          <div className="sheet-delete-modal">
            <h2>Are you sure?</h2>
            <p>This sheet will be permanently deleted.</p>

            <div className="sheet-delete-modal__actions">
              <button
                type="button"
                className="inverse-button"
                onClick={() => setConfirmingDelete(false)}
              >
                No
              </button>

              <button
                type="button"
                className="button-style danger-button"
                onClick={onDelete}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
