import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import "./SettingsModal.css";

export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="settings-button"
        aria-label="Open settings"
        onClick={() => setOpen(true)}
      >
        ⚙
      </button>

      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  );
}
