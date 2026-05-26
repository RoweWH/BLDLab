import { cornerPieces } from "../../data/CornerPieces"

export function CornerDropdown({ value, onChange }) {
    return (
      <select value={value} onChange={onChange}>
        <option value=""> -- </option>
  
        {cornerPieces.map((corner) => (
          <option key={corner} value={corner}>
            {corner}
          </option>
        ))}
      </select>
    );
  }