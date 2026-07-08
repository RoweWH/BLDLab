import { SheetExportButton } from "./SheetExportButton";
import { DisplayModeToggle } from "./DisplayModeToggle";
import "./SheetHeader.css";

export function SheetHeader({
  sheet,
  letterScheme,
  cellDisplayMode,
  onCellDisplayModeChange,
}) {
  return (
    <div className="sheet-header">
      <div className="sheet-header__left">
        <DisplayModeToggle
          value={cellDisplayMode}
          onChange={onCellDisplayModeChange}
        />
      </div>

      <div className="sheet-header__center">
        <h1>{sheet.name}</h1>
      </div>

      <div className="sheet-header__right">
        <SheetExportButton
          sheet={sheet}
          letterScheme={letterScheme}
          cellDisplayMode={cellDisplayMode}
        />
      </div>
    </div>
  );
}
