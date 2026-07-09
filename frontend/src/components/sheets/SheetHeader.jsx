import { DisplayModeToggle } from "./DisplayModeToggle";
import { SheetActionsMenu } from "./SheetActionsMenu";
import "./SheetHeader.css";

export function SheetHeader({
  sheet,
  letterScheme,
  cellDisplayMode,
  onCellDisplayModeChange,
  onDelete,
  onExportCsv,
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
        <SheetActionsMenu onDelete={onDelete} onExportCsv={onExportCsv} />
      </div>
    </div>
  );
}
