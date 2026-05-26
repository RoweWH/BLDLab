import { edgePieces } from "../../data/EdgePieces"

export function EdgeDropdown({ value, onChange }) {
    return (
      <select value={value} onChange={onChange}>
        <option value=""> -- </option>
  
        {edgePieces.map((edge) => (
          <option key={edge} value={edge}>
            {edge}
          </option>
        ))}
      </select>
    );
  }