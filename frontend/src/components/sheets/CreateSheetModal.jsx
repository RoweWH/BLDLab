import { useState } from "react";
import { EdgeDropdown } from "../selectors/EdgeDropdown";
import { CornerDropdown } from "../selectors/CornerDropdown";
import { EdgeMultiSelect } from "../selectors/EdgeMultiSelect";
import { CornerMultiSelect } from "../selectors/CornerMultiSelect";

export function CreateSheetModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    buffer: "",
    twistedCorner: "",
    edgeSwap: ["", ""],
    exclude: [],
    bufferOrder: [],
    blankSheet: false,
  });

  const isEdgesOrCorners = form.type === "edges" || form.type === "corners";
  const is2E2C = form.type === "2e2c";
  const isLTCT = form.type === "ltct";
  const isT2C = form.type === "t2c";

  function handleChange(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,

      ...(name === "type" && {
        buffer: "",
        twistedCorner: "",
        edgeSwap: ["", ""],
        exclude: [],
        bufferOrder: [],
      }),

      ...(name === "twistedCorner" && {
        bufferOrder: [],
      }),

      ...(name === "exclude" && {
        bufferOrder: [],
      }),
    }));
  }

  function handleEdgeSwapChange(index, value) {
    const newEdgeSwap = [...form.edgeSwap];
    newEdgeSwap[index] = value;

    handleChange("edgeSwap", newEdgeSwap);
  }

  function buildOptions() {
    if (isEdgesOrCorners) {
      return {
        buffer: form.buffer,
        exclude: form.exclude,
        blankSheet: form.blankSheet,
      };
    }

    if (is2E2C) {
      return {
        edgeSwap: form.edgeSwap,
        bufferOrder: form.bufferOrder,
        blankSheet: form.blankSheet,
      };
    }

    if (isLTCT) {
      return {
        edgeSwap: form.edgeSwap,
        buffer: form.buffer,
        exclude: form.exclude,
        blankSheet: form.blankSheet,
      };
    }

    if (isT2C) {
      return {
        edgeSwap: form.edgeSwap,
        twistedCorner: form.twistedCorner,
        bufferOrder: form.bufferOrder,
        exclude: form.exclude,
        blankSheet: form.blankSheet,
      };
    }

    return {
      blankSheet: form.blankSheet,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newSheet = {
      name: form.name,
      type: form.type,
      options: buildOptions(),
    };

    onCreate(newSheet);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <form className="sheet-modal" onSubmit={handleSubmit}>
        <div className="sheet-modal__header">
          <h2>Create Sheet</h2>

          <button type="button" className="modal-x" onClick={onClose}>
            ×
          </button>
        </div>

        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter sheet name"
            required
          />
        </label>

        <label>
          Type
          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            required
          >
            <option value="">Select a type</option>
            <option value="edges">Edges</option>
            <option value="corners">Corners</option>
            <option value="2e2c">2E2C</option>
            <option value="ltct">LTCT</option>
            <option value="t2c">T2C</option>
          </select>
        </label>

        {isEdgesOrCorners && (
          <div className="modal-section">
            <label>
              Buffer
              {form.type === "edges" ? (
                <EdgeDropdown
                  value={form.buffer}
                  onChange={(e) => handleChange("buffer", e.target.value)}
                />
              ) : (
                <CornerDropdown
                  value={form.buffer}
                  onChange={(e) => handleChange("buffer", e.target.value)}
                />
              )}
            </label>

            <label>
              Exclude
              {form.type === "edges" ? (
                <EdgeMultiSelect
                  buffer={form.buffer}
                  value={form.exclude}
                  onChange={(newExclude) => handleChange("exclude", newExclude)}
                />
              ) : (
                <CornerMultiSelect
                  buffer={form.buffer}
                  value={form.exclude}
                  onChange={(newExclude) => handleChange("exclude", newExclude)}
                  showNumbers={false}
                />
              )}
              <button
                type="button"
                className="clear-button"
                onClick={() => handleChange("exclude", [])}
              >
                Clear
              </button>
            </label>
          </div>
        )}

        {is2E2C && (
          <div className="modal-section">
            <label>
              Edge Swap
              <div className="pair-selectors">
                <EdgeDropdown
                  value={form.edgeSwap[0]}
                  onChange={(e) => handleEdgeSwapChange(0, e.target.value)}
                />

                <EdgeDropdown
                  value={form.edgeSwap[1]}
                  onChange={(e) => handleEdgeSwapChange(1, e.target.value)}
                />
              </div>
            </label>

            <div className="sheet-modal__field">
              <label>Buffer Order</label>

              <CornerMultiSelect
                value={form.bufferOrder}
                onChange={(newOrder) => handleChange("bufferOrder", newOrder)}
                showAllCorners={true}
                blockEquivalentCorners={true}
              />

              <button
                type="button"
                className="clear-button"
                onClick={() => handleChange("bufferOrder", [])}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {isLTCT && (
          <div className="modal-section">
            <label>
              Edge Swap
              <div className="pair-selectors">
                <EdgeDropdown
                  value={form.edgeSwap[0]}
                  onChange={(e) => handleEdgeSwapChange(0, e.target.value)}
                />

                <EdgeDropdown
                  value={form.edgeSwap[1]}
                  onChange={(e) => handleEdgeSwapChange(1, e.target.value)}
                />
              </div>
            </label>

            <label>
              Buffer
              <CornerDropdown
                value={form.buffer}
                onChange={(e) => handleChange("buffer", e.target.value)}
              />
            </label>

            <label>
              Exclude
              <CornerMultiSelect
                buffer={form.buffer}
                value={form.exclude}
                onChange={(newExclude) => handleChange("exclude", newExclude)}
                showNumbers={false}
              />
              <button
                type="button"
                className="clear-button"
                onClick={() => handleChange("exclude", [])}
              >
                Clear
              </button>
            </label>
          </div>
        )}

        {isT2C && (
          <div className="modal-section">
            <label>
              Edge Swap
              <div className="pair-selectors">
                <EdgeDropdown
                  value={form.edgeSwap[0]}
                  onChange={(e) => handleEdgeSwapChange(0, e.target.value)}
                />

                <EdgeDropdown
                  value={form.edgeSwap[1]}
                  onChange={(e) => handleEdgeSwapChange(1, e.target.value)}
                />
              </div>
            </label>

            <label>
              Twisted Corner (Buffer)
              <CornerDropdown
                value={form.twistedCorner}
                onChange={(e) => handleChange("twistedCorner", e.target.value)}
                startsWithUDOnly={true}
              />
            </label>

            <div className="sheet-modal__field">
              <label>Exclude</label>
              <CornerMultiSelect
                value={form.exclude}
                onChange={(newExclude) => handleChange("exclude", newExclude)}
                buffer={form.twistedCorner}
                showAllCorners={false}
                blockEquivalentCorners={true}
                showNumbers={false}
              />
              <button
                type="button"
                className="clear-button"
                onClick={() => handleChange("exclude", [])}
              >
                Clear
              </button>
            </div>

            <div className="sheet-modal__field">
              <label>Piece Order</label>

              <CornerMultiSelect
                value={form.bufferOrder}
                onChange={(newOrder) => handleChange("bufferOrder", newOrder)}
                buffer={[form.twistedCorner, ...form.exclude].filter(Boolean)}
                showAllCorners={true}
                blockEquivalentCorners={true}
                maxSelections={6 - form.exclude.length}
              />

              <button
                type="button"
                className="clear-button"
                onClick={() => handleChange("bufferOrder", [])}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {form.type && (
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={form.blankSheet === false}
                onChange={() => handleChange("blankSheet", false)}
              />
              Add default algorithms
            </label>

            <label>
              <input
                type="radio"
                checked={form.blankSheet === true}
                onChange={() => handleChange("blankSheet", true)}
              />
              Empty sheet
            </label>
          </div>
        )}

        <div className="sheet-modal__actions">
          <button type="button" className="inverse-button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="button-style">
            Create Sheet
          </button>
        </div>
      </form>
    </div>
  );
}
