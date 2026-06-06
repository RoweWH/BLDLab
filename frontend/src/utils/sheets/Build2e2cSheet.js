import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function normalizePiece(piece) {
  return piece.split("").sort().join("");
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

function buildBufferColumn(bufferOrder, letterScheme) {
  const firstBuffer = bufferOrder[0];

  if (!firstBuffer) {
    return {
      column: null,
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
    }));

  return {
    column: getTarget(firstBuffer, letterScheme),
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

async function build2E2CData(edgeSwap, bufferOrder, letterScheme, blankSheet) {
  const bufferColumn = buildBufferColumn(bufferOrder, letterScheme);

  const columnTargets = bufferOrder.map((corner) =>
    getTarget(corner, letterScheme)
  );

  const rowTargets = bufferColumn.rows.map((row) => row.row);

  const cycleColumns = await Promise.all(
  columnTargets.map(async (columnTarget, columnIndex) => {
    const previousBufferPieces = columnTargets
      .slice(0, columnIndex)
      .map((target) => target.piece);

    const blockedPieces = [...previousBufferPieces, columnTarget.piece];

    return {
      column: columnTarget,

      rows: await Promise.all(
        rowTargets.map(async (rowTarget) => {
          const isBlocked = blockedPieces.some(
            (blockedPiece) =>
              normalizePiece(blockedPiece) === normalizePiece(rowTarget.piece)
          );

          return {
            row: rowTarget,

            algorithms:
              blankSheet || isBlocked
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