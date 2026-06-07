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

function isSamePiece(pieceA, pieceB) {
  return normalizePiece(pieceA) === normalizePiece(pieceB);
}

function getAllEquivalentPieces(pieces = []) {
  return pieces.flatMap((piece) => getEquivalentPieces(piece));
}

function buildFirstBufferColumn(
  edgeSwap,
  twistedCorner,
  firstColumnPiece,
  exclude,
  letterScheme
) {
  const excludedPieces = [
    ...getEquivalentPieces(twistedCorner),
    ...getEquivalentPieces(firstColumnPiece),
    ...getAllEquivalentPieces(exclude),
  ];

  const rows = cornerPieces
    .filter(
      (corner) =>
        !excludedPieces.some((excludedPiece) =>
          isSamePiece(corner, excludedPiece)
        )
    )
    .map((corner) => getTarget(corner, letterScheme))
    .sort((a, b) => a.letter.localeCompare(b.letter))
    .map((target) => ({
      row: target,
      algorithms: [],
      invalid: false,
      rowSpan: 2,
    }));

  return {
    isBuffer: true,
    column: {
      piece: `${edgeSwap[0]}/${edgeSwap[1]}`,
      letter: "",
    },
    rows,
  };
}

function buildSecondBufferColumn(twistedCorner, firstBufferColumn, letterScheme) {
  const twistVariants = getEquivalentPieces(twistedCorner).filter(
    (corner) => corner !== twistedCorner
  );

  const rows = firstBufferColumn.rows.flatMap(() =>
    twistVariants.map((twistVariant) => ({
      row: getTarget(twistVariant, letterScheme),
      algorithms: [],
      invalid: false,
    }))
  );

  return {
    isBuffer: true,
    column: {
      piece: twistedCorner,
      letter: "",
    },
    rows,
  };
}

function buildRowTargets(firstBufferColumn, secondBufferColumn) {
  return secondBufferColumn.rows.map((twistCell, index) => {
    const firstBufferIndex = Math.floor(index / 2);
    const firstBufferCell = firstBufferColumn.rows[firstBufferIndex];

    return {
      row: twistCell.row,
      secondPiece: firstBufferCell.row,
      twistPiece: twistCell.row,
    };
  });
}

function isBlockedT2CCell(columnTargets, columnIndex, secondPiece) {
  const previousAndCurrentColumns = columnTargets
    .slice(0, columnIndex + 1)
    .map((target) => target.piece);

  return previousAndCurrentColumns.some((columnPiece) =>
    isSamePiece(columnPiece, secondPiece)
  );
}

async function loadT2CDefault(edgeSwap, firstPiece, secondPiece, twistPiece) {
  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      firstPiece,
      secondPiece,
      twistPiece
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
      `Failed to load T2C ${edgeSwap[0]}-${edgeSwap[1]}-${firstPiece}-${secondPiece}-${twistPiece}:`,
      error
    );

    return [];
  }
}

async function buildT2CData(
  edgeSwap,
  twistedCorner,
  bufferOrder,
  exclude,
  letterScheme,
  blankSheet
) {
  const columnTargets = bufferOrder.map((corner) =>
    getTarget(corner, letterScheme)
  );

  const firstColumnPiece = columnTargets[0]?.piece;

  if (!firstColumnPiece || !twistedCorner) {
    return {
      columns: [],
    };
  }

  const firstBufferColumn = buildFirstBufferColumn(
    edgeSwap,
    twistedCorner,
    firstColumnPiece,
    exclude,
    letterScheme
  );

  const secondBufferColumn = buildSecondBufferColumn(
    twistedCorner,
    firstBufferColumn,
    letterScheme
  );

  const rowTargets = buildRowTargets(firstBufferColumn, secondBufferColumn);

  const cycleColumns = await Promise.all(
    columnTargets.map(async (columnTarget, columnIndex) => {
      return {
        column: columnTarget,

        rows: await Promise.all(
          rowTargets.map(async (rowTarget) => {
            const invalid = isBlockedT2CCell(
              columnTargets,
              columnIndex,
              rowTarget.secondPiece.piece
            );

            return {
              row: rowTarget.row,
              secondPiece: rowTarget.secondPiece,
              twistPiece: rowTarget.twistPiece,
              invalid,
              algorithms:
                blankSheet || invalid
                  ? []
                  : await loadT2CDefault(
                      edgeSwap,
                      columnTarget.piece,
                      rowTarget.secondPiece.piece,
                      rowTarget.twistPiece.piece
                    ),
            };
          })
        ),
      };
    })
  );

  return {
    columns: [firstBufferColumn, secondBufferColumn, ...cycleColumns],
  };
}

export async function buildT2CSheet(newSheet, user) {
  const edgeSwap = newSheet.options.edgeSwap;
  const twistedCorner = newSheet.options.twistedCorner;
  const bufferOrder = newSheet.options.bufferOrder;
  const exclude = newSheet.options.exclude ?? [];
  const blankSheet = newSheet.options.blankSheet;
  const letterScheme = user.letterScheme.corners;

  const data = await buildT2CData(
    edgeSwap,
    twistedCorner,
    bufferOrder,
    exclude,
    letterScheme,
    blankSheet
  );

  return {
    ...newSheet,
    data,
  };
}