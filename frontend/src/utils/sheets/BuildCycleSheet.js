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

function getTargets(pieces, fixed = [], exclude = []) {
  return pieces.filter((piece) => {
    return !pieceIsInList(piece, fixed) && !pieceIsInList(piece, exclude);
  });
}

async function loadDefaults(type, buffer, first, second, blankSheet) {
  if (blankSheet) return [];

  if (normalizePiece(first) === normalizePiece(second)) return [];

  if (!buffer) return [];

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

async function buildCycleColumn(type, buffer, columnPiece, targets, blankSheet) {
  const rows = await Promise.all(
    targets.map(async (rowPiece) => {
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

async function buildSheetData(type, pieces, fixed, exclude, blankSheet) {
  const buffer = fixed[0];
  const targets = getTargets(pieces, fixed, exclude);

  const columns = await Promise.all(
    targets.map((columnPiece) =>
      buildCycleColumn(type, buffer, columnPiece, targets, blankSheet)
    )
  );

  return {
    bufferColumns: [targets],
    columns,
  };
}

export async function buildCycleSheet(newSheet) {
  const pieces = newSheet.type === "edges" ? edgePieces : cornerPieces;
  const fixed = newSheet.options?.fixed ?? [];
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;

  const data = await buildSheetData(
    newSheet.type,
    pieces,
    fixed,
    exclude,
    blankSheet
  );

  return {
    ...newSheet,
    data,
  };
}