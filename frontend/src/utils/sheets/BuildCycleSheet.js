import { edgePieces } from "../../data/pieces/EdgePieces";
import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getEdgeAlgs, getCornerAlgs } from "../../api/algApi";

function normalizePiece(piece = "") {
  return piece.replace(/[()]/g, "").split("").sort().join("");
}

function pieceIsInList(piece, list = []) {
  const normalizedPiece = normalizePiece(piece);

  return list
    .map((listPiece) => normalizePiece(listPiece))
    .includes(normalizedPiece);
}

function getTargets(pieces, buffer, exclude = []) {
  return pieces.filter((piece) => {
    return (
      !pieceIsInList(piece, [buffer]) &&
      !pieceIsInList(piece, exclude)
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

async function loadDefaults(type, buffer, first, second, blankSheet) {
  if (blankSheet) return [];
  if (!buffer) return [];
  if (normalizePiece(first) === normalizePiece(second)) return [];

  try {
    const response =
      type === "edges"
        ? await getEdgeAlgs(buffer, first, second)
        : await getCornerAlgs(buffer, first, second);

    const firstAlgorithm = response.data?.algorithms?.[0];

    if (!firstAlgorithm) return [];

    return [
      {
        algorithm: firstAlgorithm.id,
        primary: true,
      },
    ];
  } catch (error) {
    console.error(`Failed to load ${buffer}-${first}-${second}:`, error);
    return [];
  }
}

async function buildColumn(type, buffer, columnPiece, rowTargets, blankSheet) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = normalizePiece(columnPiece) === normalizePiece(rowPiece);

      if (invalid) {
        return {
          piece: rowPiece,
        };
      }

      return {
        piece: rowPiece,
        algorithms: await loadDefaults(
          type,
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

async function buildSheetData({
  type,
  pieces,
  headerInfo,
  buffer,
  exclude,
  blankSheet,
  letterScheme,
}) {
  const targets = sortPiecesByLetter(
    getTargets(pieces, buffer, exclude),
    letterScheme
  );

  const columns = await Promise.all(
    targets.map((columnPiece) =>
      buildColumn(type, buffer, columnPiece, targets, blankSheet)
    )
  );

  return {
    headerInfo,
    bufferColumns: [targets],
    columns,
  };
}

export async function buildCycleSheet(newSheet, user) {
  const pieces = newSheet.type === "edges" ? edgePieces : cornerPieces;

  const letterScheme =
    newSheet.type === "edges"
      ? user.letterScheme.edges
      : user.letterScheme.corners;

  const headerInfo = newSheet.options?.headerInfo ?? [];
  const buffer = newSheet.options?.buffer;
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;

  const data = await buildSheetData({
    type: newSheet.type,
    pieces,
    headerInfo,
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