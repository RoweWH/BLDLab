import { edgePieces } from "../../data/pieces/EdgePieces";
import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getEdgeAlgs, getCornerAlgs } from "../../api/algApi";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function isSamePiece(firstPiece, secondPiece) {
  return normalizePiece(firstPiece) === normalizePiece(secondPiece);
}

function pieceIsInList(piece, list = []) {
  return list.some((listPiece) => isSamePiece(piece, listPiece));
}

function getVisiblePieces(pieces, fixed = [], exclude = []) {
  return pieces.filter((piece) => {
    return !pieceIsInList(piece, fixed) && !pieceIsInList(piece, exclude);
  });
}

function buildBufferColumns(pieces, fixed, exclude) {
  return [getVisiblePieces(pieces, fixed, exclude)];
}

async function loadDefaults(buffer, first, second, blankSheet) {
  if (blankSheet) return [];

  try {
    const response =
      first.length === 2
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

async function buildCycleColumn(buffer, columnPiece, rowPieces, blankSheet) {
  const rows = await Promise.all(
    rowPieces
      .filter((rowPiece) => !isSamePiece(columnPiece, rowPiece))
      .map(async (rowPiece) => ({
        piece: rowPiece,
        algorithms: await loadDefaults(
          buffer,
          columnPiece,
          rowPiece,
          blankSheet
        ),
      }))
  );

  return {
    piece: columnPiece,
    rows,
  };
}

async function buildSheetData(pieces, fixed, exclude, blankSheet) {
  const buffer = fixed[0];
  const visiblePieces = getVisiblePieces(pieces, fixed, exclude);

  const columns = await Promise.all(
    visiblePieces.map((columnPiece) =>
      buildCycleColumn(buffer, columnPiece, visiblePieces, blankSheet)
    )
  );

  return {
    bufferColumns: buildBufferColumns(pieces, fixed, exclude),
    columns,
  };
}

export async function buildCycleSheet(newSheet) {
  const pieces = newSheet.type === "edges" ? edgePieces : cornerPieces;

  const fixed = newSheet.options.fixed ?? [];
  const exclude = newSheet.options.exclude ?? [];
  const blankSheet = newSheet.options.blankSheet;

  const data = await buildSheetData(pieces, fixed, exclude, blankSheet);

  return {
    ...newSheet,
    options: {
      fixed,
      exclude,
      blankSheet,
    },
    data,
  };
}