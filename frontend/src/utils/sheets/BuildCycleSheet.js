import { edgePieces } from "../../data/pieces/EdgePieces";
import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getEdgeAlgs, getCornerAlgs } from "../../api/algApi";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
}

function pairAndSortPieces(pieces, letterScheme, buffer) {
  return pieces
    .map((piece, index) => ({
      piece,
      letter: letterScheme.charAt(index),
    }))
    .filter((target) => {
      if (!buffer) return true;

      return normalizePiece(target.piece) !== normalizePiece(buffer);
    })
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

function buildBufferColumn(pieces, letterScheme, buffer) {
  const allPieces = pieces.map((piece, index) => ({
    piece,
    letter: letterScheme.charAt(index),
  }));

  const bufferTarget = allPieces.find(
    (target) => target.piece === buffer
  );

  if (!bufferTarget) {
    return {
      column: null,
      rows: [],
    };
  }

  const normalizedBuffer = normalizePiece(buffer);

  const rows = allPieces
    .filter(
      (target) => normalizePiece(target.piece) !== normalizedBuffer
    )
    .sort((a, b) => a.letter.localeCompare(b.letter))
    .map((target) => ({
      row: target,
      algorithms: [],
    }));

  return {
    column: bufferTarget,
    rows,
  };
}

async function loadDefaults(buffer, first, second) {
  try {
    let response;

    if (first.length === 2) {
      response = await getEdgeAlgs(buffer, first, second);
    } else if (first.length === 3) {
      response = await getCornerAlgs(buffer, first, second);
    } else {
      return [];
    }

    const firstAlgorithm = response.data?.algorithms?.[0];

    if (!firstAlgorithm) {
      return [];
    }

    return [
      {
        algorithm: firstAlgorithm.id,
        custom: "",
        primary: true,
      },
    ];
  } catch (error) {
    console.error(`Failed to load ${buffer}-${first}-${second}:`, error);
    return [];
  }
}

async function buildSheetData(pieces, letterScheme, buffer, blankSheet) {
  console.log(buffer);
  const targets = pairAndSortPieces(pieces, letterScheme, buffer);

  const bufferColumn = buildBufferColumn(pieces, letterScheme, buffer);

  const cycleColumns = await Promise.all(
    targets.map(async (columnTarget) => ({
      column: columnTarget,

      rows: await Promise.all(
        targets.map(async (rowTarget) => {
          const samePiece =
            normalizePiece(columnTarget.piece) ===
            normalizePiece(rowTarget.piece);

          return {
            row: rowTarget,

            algorithms:
              blankSheet || samePiece
                ? []
                : await loadDefaults(
                    buffer,
                    columnTarget.piece,
                    rowTarget.piece
                  ),
          };
        })
      ),
    }))
  );

  return {
    columns: [
      bufferColumn,
      ...cycleColumns,
    ],
  };
}

export async function buildCycleSheet(newSheet, user) {
  let pieces;
  let letterScheme;

  if (newSheet.type === "edges") {
    pieces = edgePieces;
    letterScheme = user.letterScheme.edges;
  } else if (newSheet.type === "corners") {
    pieces = cornerPieces;
    letterScheme = user.letterScheme.corners;
  } else {
    return newSheet;
  }

  const data = await buildSheetData(
    pieces,
    letterScheme,
    newSheet.options.buffer,
    newSheet.options.blankSheet
  );

  return {
    ...newSheet,
    data,
  };
}