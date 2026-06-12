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

function cleanPiece(piece = "") {
  return piece.replace(/[()]/g, "");
}

function getEquivalentPieces(piece) {
  const normalizedPiece = normalizePiece(piece);

  return cornerPieces.filter(
    (corner) => normalizePiece(corner) === normalizedPiece
  );
}

function getAllEquivalentPieces(pieces = []) {
  return pieces.flatMap((piece) => getEquivalentPieces(piece));
}

function getFirstBufferTargets(twistedCorner, firstColumnPiece, exclude = []) {
  if (!twistedCorner || !firstColumnPiece) return [];

  const blockedPieces = [
    ...getEquivalentPieces(twistedCorner),
    ...getEquivalentPieces(firstColumnPiece),
    ...getAllEquivalentPieces(exclude),
  ];

  return cornerPieces.filter(
    (corner) => !pieceIsInList(corner, blockedPieces)
  );
}

function getTwistVariants(twistedCorner) {
  const cleanTwistedCorner = cleanPiece(twistedCorner);

  return cornerPieces.filter((corner) => {
    const cleanCorner = cleanPiece(corner);

    return (
      normalizePiece(cleanCorner) === normalizePiece(cleanTwistedCorner) &&
      cleanCorner !== cleanTwistedCorner
    );
  });
}

function getTwistTargets(twistedCorner, firstBufferTargets) {
  if (!twistedCorner) return [];

  const twistVariants = getTwistVariants(twistedCorner);

  return firstBufferTargets.flatMap(() => twistVariants);
}

function sortPiecesByLetter(pieces = [], letterScheme = {}) {
  return [...pieces].sort((a, b) => {
    const letterA = letterScheme[a] ?? "";
    const letterB = letterScheme[b] ?? "";

    return letterA.localeCompare(letterB);
  });
}

function buildRowTargets(firstBufferTargets, twistTargets) {
  return twistTargets.map((twistPiece, index) => {
    const firstBufferIndex = Math.floor(index / 2);
    const secondPiece = firstBufferTargets[firstBufferIndex];

    return {
      piece: twistPiece,
      secondPiece,
      twistPiece,
    };
  });
}

function isBlockedT2CCell(bufferOrder, columnIndex, secondPiece) {
  const previousAndCurrentBuffers = bufferOrder.slice(0, columnIndex + 1);

  return previousAndCurrentBuffers.some((piece) =>
    pieceIsInList(secondPiece, [piece])
  );
}

async function loadT2CDefault(
  edgeSwap,
  firstPiece,
  secondPiece,
  twistPiece,
  blankSheet
) {
  if (blankSheet) return [];
  if (!edgeSwap[0] || !edgeSwap[1]) return [];
  if (!firstPiece || !secondPiece || !twistPiece) return [];

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      firstPiece,
      secondPiece,
      twistPiece
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
      `Failed to load T2C ${edgeSwap[0]}-${edgeSwap[1]}-${firstPiece}-${secondPiece}-${twistPiece}:`,
      error
    );

    return [];
  }
}

async function buildT2CColumn(
  edgeSwap,
  bufferOrder,
  columnPiece,
  columnIndex,
  rowTargets,
  blankSheet
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowTarget) => {
      const invalid = isBlockedT2CCell(
        bufferOrder,
        columnIndex,
        rowTarget.secondPiece
      );

      if (invalid) {
        return {
          piece: rowTarget.piece,
          secondPiece: rowTarget.secondPiece,
          twistPiece: rowTarget.twistPiece,
        };
      }

      return {
        piece: rowTarget.piece,
        secondPiece: rowTarget.secondPiece,
        twistPiece: rowTarget.twistPiece,
        algorithms: await loadT2CDefault(
          edgeSwap,
          columnPiece,
          rowTarget.secondPiece,
          rowTarget.twistPiece,
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

async function buildT2CData({
  edgeSwap,
  twistedCorner,
  bufferOrder,
  exclude,
  blankSheet,
  letterScheme,
}) {
  const firstColumnPiece = bufferOrder[0];

  if (!firstColumnPiece || !twistedCorner) {
    return {
      bufferColumns: [],
      columns: [],
    };
  }

  const firstBufferTargets = sortPiecesByLetter(
    getFirstBufferTargets(twistedCorner, firstColumnPiece, exclude),
    letterScheme
  );

  const twistTargets = getTwistTargets(twistedCorner, firstBufferTargets);
  const rowTargets = buildRowTargets(firstBufferTargets, twistTargets);

  const columns = await Promise.all(
    bufferOrder.map((columnPiece, columnIndex) =>
      buildT2CColumn(
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
    bufferColumns: [firstBufferTargets, twistTargets],
    columns,
  };
}

export async function buildT2CSheet(newSheet, user) {
  const edgeSwap = newSheet.options?.edgeSwap ?? [];
  const twistedCorner = newSheet.options?.twistedCorner;
  const bufferOrder = newSheet.options?.bufferOrder ?? [];
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;
  const letterScheme = user.letterScheme.corners;

  const data = await buildT2CData({
    edgeSwap,
    twistedCorner,
    bufferOrder,
    exclude,
    blankSheet,
    letterScheme,
  });

  return {
    ...newSheet,
    data,
  };
}