export function formatPiecesWithLetters(pieces = [], letterScheme = {}) {
  return pieces.map((piece) => {
    const letter = letterScheme[piece];

    return letter ? `${piece} (${letter})` : piece;
  });
}