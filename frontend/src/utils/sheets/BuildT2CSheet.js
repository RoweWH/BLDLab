import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function buildT2CCaseInfo(edgeSwap, columnPiece, rowPiece, twist) {
  return `${edgeSwap[0]}/${edgeSwap[1]}\n${columnPiece} → ${rowPiece}\n(${twist})`;
}

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

function getPieceLetter(piece, letterScheme = {}) {
  return letterScheme[piece] ?? "";
}

function buildMemoryData(pieces = [], letterScheme = {}) {
  return {
    letters: pieces.map((piece) => getPieceLetter(piece, letterScheme)).join(""),
    word: "",
  };
}

function buildRowTargets(firstBufferTargets, twistTargets) {
  return twistTargets.map((twistPiece, index) => {
    const firstBufferIndex = Math.floor(index / 2);
    const piece = firstBufferTargets[firstBufferIndex];

    return {
      piece,
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

async function loadT2CCase(
  edgeSwap,
  firstPiece,
  secondPiece,
  twistPiece,
  blankSheet
) {
  if (!edgeSwap[0] || !edgeSwap[1]) {
    return {
      id: null,
      algorithms: [],
    };
  }

  if (!firstPiece || !secondPiece || !twistPiece) {
    return {
      id: null,
      algorithms: [],
    };
  }

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      firstPiece,
      secondPiece,
      twistPiece
    );

    const parityCase = response.data;
    const firstAlgorithm = parityCase?.algorithms?.[0];

    return {
      id: parityCase?.id ?? null,
      algorithms:
        blankSheet || !firstAlgorithm
          ? []
          : [
              {
                id: firstAlgorithm.id,
                displayText: firstAlgorithm.algorithm,
                primary: true,
                source: "bldlab",
                last50: [],
              },
            ],
    };
  } catch (error) {
    console.error(
      `Failed to load T2C ${edgeSwap[0]}-${edgeSwap[1]}-${firstPiece}-${secondPiece}-${twistPiece}:`,
      error
    );

    return {
      id: null,
      algorithms: [],
    };
  }
}

async function buildT2CColumn(
  edgeSwap,
  bufferOrder,
  columnPiece,
  columnIndex,
  rowTargets,
  blankSheet,
  letterScheme
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowTarget) => {
      const invalid = isBlockedT2CCell(
        bufferOrder,
        columnIndex,
        rowTarget.piece
      );

      const caseInfo = buildT2CCaseInfo(
        edgeSwap,
        columnPiece,
        rowTarget.piece,
        rowTarget.twistPiece
      );

      if (invalid) {
        return {
          id: null,
          piece: rowTarget.piece,
          twistPiece: rowTarget.twistPiece,
        };
      }

      const loadedCase = await loadT2CCase(
        edgeSwap,
        columnPiece,
        rowTarget.piece,
        rowTarget.twistPiece,
        blankSheet
      );

      return {
        id: loadedCase.id,
        piece: rowTarget.piece,
        twistPiece: rowTarget.twistPiece,
        caseInfo,
        algorithms: loadedCase.algorithms,
        training: false,
        startedTraining: null,
        memoryData: buildMemoryData(
          [columnPiece, rowTarget.piece, rowTarget.twistPiece],
          letterScheme
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
        blankSheet,
        letterScheme
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