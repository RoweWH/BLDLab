import { TrainingCheckbox } from "./TrainingCheckbox";
import "./Cell.css";

export function Cell({
  cell,
  cellDisplayMode,
  isSelected,
  onClick,
  onToggleTraining,
}) {
  if (!cell.id) {
    return <div className="cycle-sheet-cell cycle-sheet-cell--invalid" />;
  }

  const primaryAlg = cell.algorithms?.find((alg) => alg.primary);

  const displayText =
    cellDisplayMode === "words"
      ? (cell.memoryData?.word ?? "")
      : (primaryAlg?.displayText ?? "");

  return (
    <div className="cycle-sheet-cell" onClick={onClick}>
      <span className="cycle-sheet-cell__alg">{displayText}</span>

      {isSelected && (
        <label className="training-control training-control--cell">
          <TrainingCheckbox
            checked={cell.training === true}
            stopPropagation
            title="Train this case"
            onChange={(checked) => onToggleTraining(cell.id, checked)}
            showLabel={false}
          />
        </label>
      )}
    </div>
  );
}
