import { SheetExportButton } from "./SheetExportButton";
import "./SheetHeader.css";

export function SheetHeader({ sheet}) {
  return (
    <div className="sheet-header">
      <div className="sheet-header__left" />

      <div className="sheet-header__center">
        <h1>{sheet.name}</h1>
      </div>

      <div className="sheet-header__right">
        <SheetExportButton sheet={sheet} />
      </div>
    </div>
  );
}
