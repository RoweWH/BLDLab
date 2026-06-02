import { cornerPieces } from "../../data/CornerPieces";

export function TwistDropdown({ value, onChange }) {
  const filteredCorners = cornerPieces.filter(
    (corner) => !corner.startsWith("U") && !corner.startsWith("D")
  );

  return (
    <select value={value} onChange={onChange}>
      <option value=""> -- </option>

      {filteredCorners.map((corner) => (
        <option key={corner} value={corner}>
          {corner}
        </option>
      ))}
    </select>
  );
}