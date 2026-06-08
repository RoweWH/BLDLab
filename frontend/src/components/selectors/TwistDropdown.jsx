import { cornerPieces } from "../../data/pieces/CornerPieces";

export function TwistDropdown({ value, onChange }) {
  const filteredCorners = cornerPieces.filter(
    (corner) => !corner.startsWith("U") && !corner.startsWith("D"),
  );

  return (
    <select value={value} onChange={onChange} required>
      <option value=""> -- </option>

      {filteredCorners.map((corner) => (
        <option key={corner} value={corner}>
          {corner}
        </option>
      ))}
    </select>
  );
}
