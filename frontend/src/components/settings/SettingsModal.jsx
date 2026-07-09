import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "../layout/ThemeToggle";
import { ThemeColorPicker } from "../layout/ThemeColorPicker";
import {
  getCurrentUser,
  updateCurrentUserLetterScheme,
} from "../../api/userApi";
import {
  getLocalSettings,
  normalizeLetterScheme,
  saveLocalLetterScheme,
} from "../../storage/settingsStorage";
import { LetterSchemeGrid } from "./LetterSchemeGrid";
import "./SettingsModal.css";

export function SettingsModal({ onClose }) {
  const [letterScheme, setLetterScheme] = useState(null);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const userResponse = await getCurrentUser();

        setUser(userResponse.data);
        setLetterScheme(normalizeLetterScheme(userResponse.data.letterScheme));
      } catch {
        const settings = await getLocalSettings();

        setUser(null);
        setLetterScheme(normalizeLetterScheme(settings.letterScheme));
      }
    }

    loadSettings();
  }, []);

  function handleLetterChange(type, piece, value) {
    setLetterScheme((currentScheme) => ({
      ...currentScheme,
      [type]: {
        ...currentScheme[type],
        [piece]: value,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);

    try {
      const normalizedScheme = normalizeLetterScheme(letterScheme);

      if (user) {
        await updateCurrentUserLetterScheme(normalizedScheme);
      } else {
        await saveLocalLetterScheme(normalizedScheme);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save letter scheme:", error);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="settings-modal-backdrop" onMouseDown={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-modal__header">
          <h2 id="settings-title">Settings</h2>

          <button
            type="button"
            className="settings-modal__close"
            aria-label="Close settings"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="settings-modal__body">
          <section className="settings-section">
            <h3 className="settings-section__title">Display</h3>

            <div className="settings-display__row">
              <span className="settings-display__label">Light / Dark</span>
              <ThemeToggle />
            </div>

            <ThemeColorPicker />
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">Lettering Scheme</h3>

            {letterScheme ? (
              <LetterSchemeGrid
                scheme={letterScheme}
                onChange={handleLetterChange}
              />
            ) : (
              <p>Loading settings...</p>
            )}
          </section>

          <div className="settings-modal__actions">
            <button
              type="button"
              className="settings-modal__save"
              disabled={saving || !letterScheme}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}