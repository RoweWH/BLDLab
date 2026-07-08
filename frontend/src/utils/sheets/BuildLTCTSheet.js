import { cornerPieces } from "../../data/pieces/CornerPieces";
import { getParityAlgs } from "../../api/algApi";

function buildLTCTCaseInfo(edgeSwap, buffer, columnPiece, rowPiece) {
  return `${edgeSwap[0]}/${edgeSwap[1]}\n${buffer} → ${columnPiece}\n(${rowPiece})`;
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

function startsWithUOrD(piece = "") {
  const cleanPiece = piece.replace(/[()]/g, "");
  return cleanPiece.startsWith("U") || cleanPiece.startsWith("D");
}

function getColumnTargets(buffer, exclude = []) {
  return cornerPieces.filter((corner) => {
    return !pieceIsInList(corner, [buffer]) && !pieceIsInList(corner, exclude);
  });
}

function getRowTargets(buffer, exclude = []) {
  return cornerPieces.filter((corner) => {
    return (
      !pieceIsInList(corner, [buffer]) &&
      !pieceIsInList(corner, exclude) &&
      !startsWithUOrD(corner)
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

function getPieceLetter(piece, letterScheme = {}) {
  return letterScheme[piece] ?? "";
}

function buildMemoryData(pieces = [], letterScheme = {}) {
  return {
    letters: pieces.map((piece) => getPieceLetter(piece, letterScheme)).join(""),
    word: "",
  };
}

async function loadLTCTCase(
  edgeSwap,
  buffer,
  columnPiece,
  rowPiece,
  blankSheet
) {
  if (!edgeSwap[0] || !edgeSwap[1]) {
    return {
      id: null,
      algorithms: [],
    };
  }

  if (!buffer) {
    return {
      id: null,
      algorithms: [],
    };
  }

  if (normalizePiece(columnPiece) === normalizePiece(rowPiece)) {
    return {
      id: null,
      algorithms: [],
    };
  }

  try {
    const response = await getParityAlgs(
      edgeSwap[0],
      edgeSwap[1],
      buffer,
      columnPiece,
      rowPiece.replace(/[()]/g, "")
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
      `Failed to load LTCT ${edgeSwap[0]}-${edgeSwap[1]}-${buffer}-${columnPiece}-${rowPiece}:`,
      error
    );

    return {
      id: null,
      algorithms: [],
    };
  }
}

async function buildLTCTColumn(
  edgeSwap,
  buffer,
  columnPiece,
  rowTargets,
  blankSheet,
  letterScheme
) {
  const rows = await Promise.all(
    rowTargets.map(async (rowPiece) => {
      const invalid = normalizePiece(columnPiece) === normalizePiece(rowPiece);
      const caseInfo = buildLTCTCaseInfo(edgeSwap, buffer, columnPiece, rowPiece);

      if (invalid) {
        return {
          id: null,
          piece: rowPiece,
        };
      }

      const loadedCase = await loadLTCTCase(
        edgeSwap,
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
        memoryData: buildMemoryData([columnPiece, rowPiece], letterScheme),
      };
    })
  );

  return {
    piece: columnPiece,
    rows,
  };
}

async function buildLTCTData({
  edgeSwap,
  buffer,
  exclude,
  blankSheet,
  letterScheme,
}) {
  const columnTargets = sortPiecesByLetter(
    getColumnTargets(buffer, exclude),
    letterScheme
  );

  const rowTargets = sortPiecesByLetter(
    getRowTargets(buffer, exclude),
    letterScheme
  );

  const columns = await Promise.all(
    columnTargets.map((columnPiece) =>
      buildLTCTColumn(
        edgeSwap,
        buffer,
        columnPiece,
        rowTargets,
        blankSheet,
        letterScheme
      )
    )
  );

  return {
    bufferColumns: [rowTargets],
    columns,
  };
}

export async function buildLTCTSheet(newSheet, user) {
  const edgeSwap = newSheet.options?.edgeSwap ?? [];
  const buffer = newSheet.options?.buffer;
  const exclude = newSheet.options?.exclude ?? [];
  const blankSheet = newSheet.options?.blankSheet ?? false;
  const letterScheme = user.letterScheme.corners;

  const data = await buildLTCTData({
    edgeSwap,
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