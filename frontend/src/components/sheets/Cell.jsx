export function Cell({ cell, onClick }) {
  if (!cell.algorithms) {
    return <div className="cycle-sheet-cell cycle-sheet-cell--invalid" />;
  }

  const primaryAlg = cell.algorithms.find((alg) => alg.primary);
  const displayText = primaryAlg?.displayText ?? "";

  return (
    <div className="cycle-sheet-cell" onClick={onClick}>
      {displayText}
    </div>
  );
}
