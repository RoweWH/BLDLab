import { edgePieces } from "../../data/pieces/EdgePieces";
import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getEdgeAlgs, getCornerAlgs } from "../../api/algApi";


function buildCycleCaseInfo(buffer, columnPiece, rowPiece) {
  return `${buffer} → ${columnPiece} → ${rowPiece}`;
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

function getTargets(pieces, buffer, exclude = []) {
  return pieces.filter((piece) => {
    return (
      !pieceIsInList(piece, [buffer]) &&
      !pieceIsInList(piece, exclude)
    );
  });
}

function sortPiecesByLetter(pieces = [], letterScheme = {}) {
  return [...pieces].sort((a, b) => {
    const letterA = letterScheme[a] ?? "";
    const letterB = letterScheme[b] ?? "";

    return letterA.localeCompare(letterB);
  });
}

async function loadCase(type, buffer, first, second, blankSheet) {
  if (!buffer) {
    return {
      id: null,
      algorithms: [],
    };
  }

  if (normalizePiece(first) === normalizePiece(second)) {
    return {
      id: null,
      algorithms: [],
    };
  }

  try {
    const response =
      type === "edges"
        ? await getEdgeAlgs(buffer, first, second)
        : await getCornerAlgs(buffer, first, second);

    const loadedCase = response.data;
    const firstAlgorithm = loadedCase?.algorithms?.[0];

    return {
      id: loadedCase?.id ?? null,
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
    console.error(`Failed to load ${buffer}-${first}-${second}:`, error);

    return {
      id: null,
      algorithms: [],
    };
  }
}

async function buildColumn(type, buffer, columnPiece, rowTargets, blankSheet) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = normalizePiece(columnPiece) === normalizePiece(rowPiece);
      const caseInfo = buildCycleCaseInfo(buffer, columnPiece, rowPiece);

      if (invalid) {
        return {
          id: null,
          piece: rowPiece,
        };
      }

      const loadedCase = await loadCase(
        type,
        buffer,
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

async function buildSheetData({
  type,
  pieces,
  buffer,
  exclude,
  blankSheet,
  letterScheme,
}) {
  const targets = sortPiecesByLetter(
    getTargets(pieces, buffer, exclude),
    letterScheme
  );

  const columns = await Promise.all(
    targets.map((columnPiece) =>
      buildColumn(type, buffer, columnPiece, targets, blankSheet)
    )
  );

  return {
    bufferColumns: [targets],
    columns,
  };
}

export async function buildCycleSheet(newSheet, user) {
  const pieces = newSheet.type === "edges" ? edgePieces : cornerPieces;

  const letterScheme =
    newSheet.type === "edges"
      ? user.letterScheme.edges
      : user.letterScheme.corners;

  const buffer = newSheet.options?.buffer;
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;

  const data = await buildSheetData({
    type: newSheet.type,
    pieces,
    buffer,
    exclude,
    blankSheet,
    letterScheme,
  });

  return {
    ...newSheet,
    data,
  };
}