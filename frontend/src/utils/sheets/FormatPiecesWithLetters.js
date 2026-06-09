export function formatPiecesWithLetters(pieces = [], letterScheme = {}) {
  return [...pieces]
    .sort((a, b) => {
      const letterA = letterScheme[a] ?? "";
      const letterB = letterScheme[b] ?? "";

      return letterA.localeCompare(letterB);
    })
    .map((piece) => {
      const letter = letterScheme[piece];

      return letter ? `${piece} (${letter})` : piece;
    });
}