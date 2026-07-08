function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function getHeaderText(piece, cellDisplayMode, letterScheme) {
  if (cellDisplayMode === "words") {
    return letterScheme?.[piece] ?? "";
  }

  return piece;
}

function getCellText(row, cellDisplayMode) {
  if (cellDisplayMode === "words") {
    return row.memoryData?.word ?? "";
  }

  return row.algorithms?.map((alg) => alg.displayText).join("\n") ?? "";
}

function expandBufferColumn(bufferColumn, targetLength) {
  if (!bufferColumn?.length) return [];

  const repeatCount = Math.ceil(targetLength / bufferColumn.length);
  const expanded = [];

  bufferColumn.forEach((piece) => {
    for (let i = 0; i < repeatCount; i++) {
      expanded.push(piece);
    }
  });

  return expanded.slice(0, targetLength);
}

function createSheetCsv(sheet, cellDisplayMode, letterScheme) {
  const rows = [];
  const bufferColumns = sheet.data.bufferColumns ?? [];
  const columns = sheet.data.columns ?? [];

  const maxRows = Math.max(
    0,
    ...bufferColumns.map((bufferColumn) => bufferColumn.length),
    ...columns.map((column) => column.rows.length),
  );

  const expandedBufferColumns = bufferColumns.map((bufferColumn) =>
    expandBufferColumn(bufferColumn, maxRows),
  );

  rows.push([
    ...expandedBufferColumns.map(() => ""),
    ...columns.map((column) =>
      getHeaderText(column.piece, cellDisplayMode, letterScheme),
    ),
  ]);

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    rows.push([
      ...expandedBufferColumns.map((bufferColumn) =>
        getHeaderText(bufferColumn[rowIndex], cellDisplayMode, letterScheme),
      ),
      ...columns.map((column) => {
        const row = column.rows[rowIndex];
        return row ? getCellText(row, cellDisplayMode) : "";
      }),
    ]);
  }

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

function getSafeFileName(name) {
  return String(name ?? "sheet")
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function SheetExportButton({ sheet, letterScheme, cellDisplayMode }) {
  function exportSheetCsv() {
    const csv = createSheetCsv(sheet, cellDisplayMode, letterScheme);
    const filename = `${getSafeFileName(sheet.name)}-${cellDisplayMode}.csv`;

    downloadCsv(filename, csv);
  }

  return (
    <button type="button" className="button-style" onClick={exportSheetCsv}>
      Export CSV
    </button>
  );
}
