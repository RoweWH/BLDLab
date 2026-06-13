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

function startsWithUOrD(piece = "") {
  const cleanPiece = piece.replace(/[()]/g, "");
  return cleanPiece.startsWith("U") || cleanPiece.startsWith("D");
}

function getColumnTargets(buffer, exclude = []) {
  return cornerPieces.filter((corner) => {
    return (
      !pieceIsInList(corner, [buffer]) &&
      !pieceIsInList(corner, exclude)
    );
  });
}

function getRowTargets(buffer, exclude = []) {
  return cornerPieces.filter((corner) => {
    return (
      !pieceIsInList(corner, [buffer]) &&
      !pieceIsInList(corner, exclude) &&
      !startsWithUOrD(corner)
    );
  });
}

function sortPiecesByLetter(pieces = [], letterScheme = {}) {
  return [...pieces].sort((a, b) => {
    const letterA = letterScheme[a] ?? "";
    const letterB = letterScheme[b] ?? "";

    return letterA.localeCompare(letterB);
  });
}

async function loadLTCTDefault(
  edgeSwap,
  buffer,
  columnPiece,
  rowPiece,
  blankSheet
) {
  if (blankSheet) return [];
  if (!edgeSwap[0] || !edgeSwap[1]) return [];
  if (!buffer) return [];
  if (normalizePiece(columnPiece) === normalizePiece(rowPiece)) return [];

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      buffer,
      columnPiece,
      rowPiece.replace(/[()]/g, "")
    );

    const firstAlgorithm = response.data?.algorithms?.[0];

    if (!firstAlgorithm) return [];

    return [
      {
        algorithmId: firstAlgorithm.id,
        displayText: firstAlgorithm.algorithm,
        primary: true,
        source: "bldlab",
        status: "public"
      },
    ];
  } catch (error) {
    console.error(
      `Failed to load LTCT ${edgeSwap[0]}-${edgeSwap[1]}-${buffer}-${columnPiece}-${rowPiece}:`,
      error
    );

    return [];
  }
}

async function buildLTCTColumn(
  edgeSwap,
  buffer,
  columnPiece,
  rowTargets,
  blankSheet
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = normalizePiece(columnPiece) === normalizePiece(rowPiece);

      if (invalid) {
        return {
          id: rowPiece,
          piece: rowPiece,
        };
      }

      return {
        id: rowPiece,
        piece: rowPiece,
        algorithms: await loadLTCTDefault(
          edgeSwap,
          buffer,
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

async function buildLTCTData({
  edgeSwap,
  buffer,
  exclude,
  blankSheet,
  letterScheme,
}) {
  const columnTargets = sortPiecesByLetter(
    getColumnTargets(buffer, exclude),
    letterScheme
  );

  const rowTargets = sortPiecesByLetter(
    getRowTargets(buffer, exclude),
    letterScheme
  );

  const columns = await Promise.all(
    columnTargets.map((columnPiece) =>
      buildLTCTColumn(edgeSwap, buffer, columnPiece, rowTargets, blankSheet)
    )
  );

  return {
    bufferColumns: [rowTargets],
    columns,
  };
}

export async function buildLTCTSheet(newSheet, user) {
  const edgeSwap = newSheet.options?.edgeSwap ?? [];
  const buffer = newSheet.options?.buffer;
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;
  const letterScheme = user.letterScheme.corners;

  const data = await buildLTCTData({
    edgeSwap,
    buffer,
    exclude,
    blankSheet,
    letterScheme,
  });

  return {
    ...newSheet,
    data,
  };
}