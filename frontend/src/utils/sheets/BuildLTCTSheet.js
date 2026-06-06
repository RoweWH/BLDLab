import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function normalizePiece(piece) {
  return piece.replace(/[()]/g, "").split("").sort().join("");
}

function isExcluded(piece, exclude = []) {
  const normalizedPiece = normalizePiece(piece);

  return exclude.some(
    (excludedPiece) => normalizePiece(excludedPiece) === normalizedPiece
  );
}

function startsWithUOrD(piece) {
  const cleanPiece = piece.replace(/[()]/g, "");
  return cleanPiece.startsWith("U") || cleanPiece.startsWith("D");
}

function countAlgorithms(columns) {
  return columns.reduce((total, column) => {
    return (
      total +
      column.rows.reduce((sum, row) => sum + row.algorithms.length, 0)
    );
  }, 0);
}

function getTarget(piece, letterScheme) {
  const index = cornerPieces.indexOf(piece);

  return {
    piece,
    letter: letterScheme.charAt(index),
  };
}

function buildBufferColumn(edgeSwap, cornerBuffer, letterScheme, exclude = []) {
  const fullExclude = [...exclude, cornerBuffer];

  const rows = cornerPieces
    .filter((corner) => !isExcluded(corner, fullExclude))
    .filter((corner) => !startsWithUOrD(corner))
    .map((corner) => getTarget(corner, letterScheme))
    .sort((a, b) => a.letter.localeCompare(b.letter))
    .map((target) => ({
      row: {
        ...target,
        piece: `(${target.piece})`,
      },
      algorithms: [],
    }));

  return {
    column: {
      piece: `${cornerBuffer} ${edgeSwap[0]}/${edgeSwap[1]}`,
      letter: "",
    },
    rows,
  };
}

async function loadLTCTDefault(edgeSwap, buffer, secondCorner, twist) {
  try {
    const cleanTwist = twist.replace(/[()]/g, "");

    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      buffer,
      secondCorner,
      cleanTwist
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
      `Failed to load LTCT ${edgeSwap[0]}-${edgeSwap[1]}-${buffer}-${secondCorner}-${twist}:`,
      error
    );

    return [];
  }
}

async function buildLTCTData(
  edgeSwap,
  cornerBuffer,
  letterScheme,
  blankSheet,
  exclude = []
) {
  const fullExclude = [...exclude, cornerBuffer];

  const bufferColumn = buildBufferColumn(
    edgeSwap,
    cornerBuffer,
    letterScheme,
    exclude
  );

  const columnTargets = cornerPieces
    .filter((corner) => !isExcluded(corner, fullExclude))
    .map((corner) => getTarget(corner, letterScheme))
    .sort((a, b) => a.letter.localeCompare(b.letter));

  const rowTargets = bufferColumn.rows.map((row) => row.row);

  const cycleColumns = await Promise.all(
    columnTargets.map(async (columnTarget) => ({
      column: columnTarget,

      rows: await Promise.all(
        rowTargets.map(async (rowTarget) => ({
          row: rowTarget,

          algorithms: blankSheet
            ? []
            : await loadLTCTDefault(
                edgeSwap,
                cornerBuffer,
                columnTarget.piece,
                rowTarget.piece
              ),
        }))
      ),
    }))
  );

  const algCount = countAlgorithms(cycleColumns);

  return {
    columns: [
      {
        ...bufferColumn,
        column: {
          ...bufferColumn.column,
          piece: `${bufferColumn.column.piece}\n(${algCount})`,
        },
      },
      ...cycleColumns,
    ],
  };
}

export async function buildLTCTSheet(newSheet, user) {
  const edgeSwap = newSheet.options.edgeSwap;
  const cornerBuffer = newSheet.options.buffer;
  const blankSheet = newSheet.options.blankSheet;
  const exclude = newSheet.options.exclude ?? [];
  const letterScheme = user.letterScheme.corners;

  const data = await buildLTCTData(
    edgeSwap,
    cornerBuffer,
    letterScheme,
    blankSheet,
    exclude
  );

  return {
    ...newSheet,
    data,
  };
}