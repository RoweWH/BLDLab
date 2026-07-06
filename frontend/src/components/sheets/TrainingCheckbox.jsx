import "./TrainingCheckbox.css";

export function TrainingCheckbox({
  checked = false,
  onChange,
  title = "",
  className = "",
  stopPropagation = false,
  showLabel = true,
  showAll = false,
}) {
  function handleClick(e) {
    if (stopPropagation) {
      e.stopPropagation();
    }
  }

  function handleChange(e) {
    if (stopPropagation) {
      e.stopPropagation();
    }

    onChange?.(e.target.checked);
  }

  return (
    <label className={`training-checkbox-wrapper ${className}`}>
      {showLabel && (
      showAll === true ? (
        <span className="training-checkbox-label">Train All</span>
      ) : (
        <span className="training-checkbox-label">Train</span>
      ))}
      
      <input
        type="checkbox"
        className="training-checkbox"
        checked={checked === true}
        title={title}
        onClick={handleClick}
        onChange={handleChange}
      />
    </label>
  );
}
