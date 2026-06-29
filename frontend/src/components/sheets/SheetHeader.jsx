import { SheetExportButton } from "./SheetExportButton";

export function SheetHeader({ sheet, isSaving }) {
  return (
    <div className="sheet-header">
      <div className="sheet-header__left" />

      <div className="sheet-header__center">
        <h1>{sheet.name}</h1>
        {isSaving && <span>Saving...</span>}
      </div>

      <div className="sheet-header__right">
        <SheetExportButton sheet={sheet} />
      </div>
    </div>
  );
}
