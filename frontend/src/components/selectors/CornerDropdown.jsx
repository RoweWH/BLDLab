import { cornerPieces } from "../../data/pieces/CornerPieces";

export function CornerDropdown({
  name,
  value,
  onChange,
  startsWithUDOnly = false,
}) {
  const cornersToShow = startsWithUDOnly
    ? cornerPieces.filter(
        (corner) => corner.startsWith("U") || corner.startsWith("D"),
      )
    : cornerPieces;

  return (
    <select name={name} value={value} onChange={onChange}>
      <option value=""> -- </option>

      {cornersToShow.map((corner) => (
        <option key={corner} value={corner}>
          {corner}
        </option>
      ))}
    </select>
  );
}
