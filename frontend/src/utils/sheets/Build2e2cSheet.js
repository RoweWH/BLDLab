import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function build2e2cCaseInfo(edgeSwap, columnPiece, rowPiece) {
  return `${edgeSwap[0]}/${edgeSwap[1]}\n${columnPiece} → ${rowPiece}`;
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

function getEquivalentPieces(piece) {
  const normalizedPiece = normalizePiece(piece);

  return cornerPieces.filter(
    (corner) => normalizePiece(corner) === normalizedPiece
  );
}

function getTargets(firstBuffer) {
  if (!firstBuffer) return [];

  const excludedPieces = getEquivalentPieces(firstBuffer);

  return cornerPieces.filter(
    (corner) => !pieceIsInList(corner, excludedPieces)
  );
}

function sortPiecesByLetter(pieces = [], letterScheme = {}) {
  return [...pieces].sort((a, b) => {
    const letterA = letterScheme[a] ?? "";
    const letterB = letterScheme[b] ?? "";

    return letterA.localeCompare(letterB);
  });
}

async function load2E2CCase(edgeSwap, columnPiece, rowPiece, blankSheet) {
  if (!edgeSwap[0] || !edgeSwap[1]) {
    return {
      id: null,
      algorithms: [],
    };
  }

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      columnPiece,
      rowPiece,
      ""
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
      `Failed to load 2E2C ${edgeSwap[0]}-${edgeSwap[1]}-${columnPiece}-${rowPiece}:`,
      error
    );

    return {
      id: null,
      algorithms: [],
    };
  }
}

function isBlocked2E2CCell(bufferOrder, columnIndex, rowPiece) {
  const previousAndCurrentBuffers = bufferOrder.slice(0, columnIndex + 1);

  return previousAndCurrentBuffers.some((piece) =>
    pieceIsInList(rowPiece, [piece])
  );
}

async function build2E2CColumn(
  edgeSwap,
  bufferOrder,
  columnPiece,
  columnIndex,
  rowTargets,
  blankSheet
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = isBlocked2E2CCell(bufferOrder, columnIndex, rowPiece);
      const caseInfo = build2e2cCaseInfo(edgeSwap, columnPiece, rowPiece);

      if (invalid) {
        return {
          id: null,
          piece: rowPiece,
        };
      }

      const loadedCase = await load2E2CCase(
        edgeSwap,
        columnPiece,
        rowPiece,
        blankSheet
      );

      return {
        id: loadedCase.id,
        piece: rowPiece,
        caseInfo,
        algorithms: loadedCase.algorithms,
        training: false,
        startedTraining: null,
      };
    })
  );

  return {
    piece: columnPiece,
    rows,
  };
}

async function build2E2CData({
  edgeSwap,
  bufferOrder,
  blankSheet,
  letterScheme,
}) {
  const firstBuffer = bufferOrder[0];

  const rowTargets = sortPiecesByLetter(getTargets(firstBuffer), letterScheme);

  const columns = await Promise.all(
    bufferOrder.map((columnPiece, columnIndex) =>
      build2E2CColumn(
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
    bufferColumns: [rowTargets],
    columns,
  };
}

export async function build2e2cSheet(newSheet, user) {
  const edgeSwap = newSheet.options?.edgeSwap ?? [];
  const bufferOrder = newSheet.options?.bufferOrder ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;
  const letterScheme = user.letterScheme.corners;

  const data = await build2E2CData({
    edgeSwap,
    bufferOrder,
    blankSheet,
    letterScheme,
  });

  return {
    ...newSheet,
    data,
  };
}