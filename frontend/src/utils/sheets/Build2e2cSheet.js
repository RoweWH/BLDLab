import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function normalizePiece(piece = "") {
  return piece.replace(/[()]/g, "").split("").sort().join("");
}

function pieceIsInList(piece, list = []) {
  const normalizedPiece = normalizePiece(piece);

  return list
    .map((listPiece) => normalizePiece(listPiece))
    .includes(normalizedPiece);
}

function getEquivalentPieces(piece) {
  const normalizedPiece = normalizePiece(piece);

  return cornerPieces.filter(
    (corner) => normalizePiece(corner) === normalizedPiece
  );
}

function getTargets(firstBuffer) {
  if (!firstBuffer) return [];

  const excludedPieces = getEquivalentPieces(firstBuffer);

  return cornerPieces.filter(
    (corner) => !pieceIsInList(corner, excludedPieces)
  );
}

function sortPiecesByLetter(pieces = [], letterScheme = {}) {
  return [...pieces].sort((a, b) => {
    const letterA = letterScheme[a] ?? "";
    const letterB = letterScheme[b] ?? "";

    return letterA.localeCompare(letterB);
  });
}

async function load2E2CDefault(edgeSwap, columnPiece, rowPiece, blankSheet) {
  if (blankSheet) return [];
  if (!edgeSwap[0] || !edgeSwap[1]) return [];

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      columnPiece,
      rowPiece,
      ""
    );

    const firstAlgorithm = response.data?.algorithms?.[0];

    if (!firstAlgorithm) return [];

    return [
      {
        algorithm: firstAlgorithm.id,
        primary: true,
      },
    ];
  } catch (error) {
    console.error(
      `Failed to load 2E2C ${edgeSwap[0]}-${edgeSwap[1]}-${columnPiece}-${rowPiece}:`,
      error
    );
    return [];
  }
}

function isBlocked2E2CCell(bufferOrder, columnIndex, rowPiece) {
  const previousAndCurrentBuffers = bufferOrder.slice(0, columnIndex + 1);

  return previousAndCurrentBuffers.some((piece) =>
    pieceIsInList(rowPiece, [piece])
  );
}

async function build2E2CColumn(
  edgeSwap,
  bufferOrder,
  columnPiece,
  columnIndex,
  rowTargets,
  blankSheet
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = isBlocked2E2CCell(bufferOrder, columnIndex, rowPiece);

      if (invalid) {
        return {
          piece: rowPiece,
        };
      }

      return {
        piece: rowPiece,
        algorithms: await load2E2CDefault(
          edgeSwap,
          columnPiece,
          rowPiece,
          blankSheet
        ),
      };
    })
  );

  return {
    piece: columnPiece,
    rows,
  };
}

async function build2E2CData({
  headerInfo,
  edgeSwap,
  bufferOrder,
  blankSheet,
  letterScheme,
}) {
  const firstBuffer = bufferOrder[0];

  const rowTargets = sortPiecesByLetter(
    getTargets(firstBuffer),
    letterScheme
  );

  const columns = await Promise.all(
    bufferOrder.map((columnPiece, columnIndex) =>
      build2E2CColumn(
        edgeSwap,
        bufferOrder,
        columnPiece,
        columnIndex,
        rowTargets,
        blankSheet
      )
    )
  );

  return {
    headerInfo,
    bufferColumns: [rowTargets],
    columns,
  };
}

export async function build2e2cSheet(newSheet, user) {
  const headerInfo = newSheet.options?.headerInfo ?? [];
  const edgeSwap = newSheet.options?.edgeSwap ?? [];
  const bufferOrder = newSheet.options?.bufferOrder ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;
  const letterScheme = user.letterScheme.corners;

  const data = await build2E2CData({
    headerInfo,
    edgeSwap,
    bufferOrder,
    blankSheet,
    letterScheme,
  });

  return {
    ...newSheet,
    data,
  };
}