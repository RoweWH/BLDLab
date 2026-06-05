import { cornerPieces } from "../../data/pieces/CornerPieces";

export function CornerDropdown({ name, value, onChange }) {
  return (
    <select name={name} value={value} onChange={onChange}>
      <option value=""> -- </option>

      {cornerPieces.map((corner) => (
        <option key={corner} value={corner}>
          {corner}
        </option>
      ))}
    </select>
  );
}
