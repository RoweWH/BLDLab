import { edgePieces } from "../../data/EdgePieces";

export function EdgeDropdown({ name, value, onChange }) {
  return (
    <select name={name} value={value} onChange={onChange}>
      <option value=""> -- </option>

      {edgePieces.map((edge) => (
        <option key={edge} value={edge}>
          {edge}
        </option>
      ))}
    </select>
  );
}
