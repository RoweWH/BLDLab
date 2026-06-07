import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function normalizePiece(piece) {
  return piece.replace(/[()]/g, "").split("").sort().join("");
}

function getTarget(piece, letterScheme) {
  const index = cornerPieces.indexOf(piece);

  return {
    piece,
    letter: letterScheme.charAt(index),
  };
}

function getEquivalentPieces(piece) {
  const normalizedPiece = normalizePiece(piece);

  return cornerPieces.filter(
    (corner) => normalizePiece(corner) === normalizedPiece
  );
}

function buildBufferColumn(edgeSwap, bufferOrder, letterScheme) {
  const firstBuffer = bufferOrder[0];

  const columnPiece = `${edgeSwap[0]}/${edgeSwap[1]}`;

  if (!firstBuffer) {
    return {
      column: {
        piece: columnPiece,
        letter: "",
      },
      rows: [],
    };
  }

  const excludedPieces = getEquivalentPieces(firstBuffer);

  const rows = cornerPieces
    .filter((corner) => !excludedPieces.includes(corner))
    .map((corner) => getTarget(corner, letterScheme))
    .sort((a, b) => a.letter.localeCompare(b.letter))
    .map((target) => ({
      row: target,
      algorithms: [],
      invalid: false,
    }));

  return {
    column: {
      piece: columnPiece,
      letter: "",
    },
    rows,
  };
}

async function load2E2CDefault(edgeSwap, columnPiece, rowPiece) {
  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      columnPiece,
      rowPiece,
      ""
    );

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
    console.error(
      `Failed to load 2E2C ${edgeSwap[0]}-${edgeSwap[1]}-${columnPiece}-${rowPiece}:`,
      error
    );

    return [];
  }
}

function isSamePiece(pieceA, pieceB) {
  return normalizePiece(pieceA) === normalizePiece(pieceB);
}

function isBlocked2E2CCell(columnTargets, columnIndex, rowPiece) {
  const previousAndCurrentBuffers = columnTargets
    .slice(0, columnIndex + 1)
    .map((target) => target.piece);

  return previousAndCurrentBuffers.some((piece) => isSamePiece(piece, rowPiece));
}

async function build2E2CData(edgeSwap, bufferOrder, letterScheme, blankSheet) {
  const bufferColumn = buildBufferColumn(edgeSwap, bufferOrder, letterScheme);

  const columnTargets = bufferOrder.map((corner) =>
    getTarget(corner, letterScheme)
  );

  const rowTargets = bufferColumn.rows.map((row) => row.row);

  const cycleColumns = await Promise.all(
    columnTargets.map(async (columnTarget, columnIndex) => {
      return {
        column: columnTarget,

        rows: await Promise.all(
          rowTargets.map(async (rowTarget) => {
            const invalid = isBlocked2E2CCell(
              columnTargets,
              columnIndex,
              rowTarget.piece
            );

            return {
              row: rowTarget,
              invalid,
              algorithms:
                blankSheet || invalid
                  ? []
                  : await load2E2CDefault(
                      edgeSwap,
                      columnTarget.piece,
                      rowTarget.piece
                    ),
            };
          })
        ),
      };
    })
  );

  return {
    columns: [bufferColumn, ...cycleColumns],
  };
}

export async function build2e2cSheet(newSheet, user) {
  const edgeSwap = newSheet.options.edgeSwap;
  const bufferOrder = newSheet.options.bufferOrder;
  const blankSheet = newSheet.options.blankSheet;
  const letterScheme = user.letterScheme.corners;

  const data = await build2E2CData(
    edgeSwap,
    bufferOrder,
    letterScheme,
    blankSheet
  );

  return {
    ...newSheet,
    data,
  };
}