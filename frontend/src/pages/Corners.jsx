import { useEffect, useState } from "react";
import { getCornerAlgs } from "../api/algApi";
import { CornerDropdown } from "../components/selectors/CornerDropdown";
import { AlgorithmList } from "../components/ui/AlgorithmList";

export function Corners() {
  const [cornerCase, setCornerCase] = useState({
    buffer: "",
    first: "",
    second: "",
  });

  const [error, setError] = useState("");

  const [algorithms, setAlgorithms] = useState();

  useEffect(() => {
    if (!cornerCase.buffer || !cornerCase.first || !cornerCase.second) {
      setAlgorithms(null);
      setError("");
      return;
    }

    async function loadAlgorithms() {
      try {
        setError("");
        const response = await getCornerAlgs(
          cornerCase.buffer,
          cornerCase.first,
          cornerCase.second,
        );
        setAlgorithms(response.data);
      } catch (error) {
        setAlgorithms(null);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("Failed to load algorithms.");
        }
      }
    }

    loadAlgorithms();
  }, [cornerCase.buffer, cornerCase.first, cornerCase.second]);

  const showInverse = () => {
    setCornerCase((prev) => ({
      ...prev,
      first: prev.second,
      second: prev.first,
    }));
  };

  return (
    <>
      <div className="selectors">
        <div className="dropdown-group">
          <label>Buffer</label>
          <CornerDropdown
            value={cornerCase.buffer}
            onChange={(e) =>
              setCornerCase((prev) => ({
                ...prev,
                buffer: e.target.value,
              }))
            }
            placeholder="Buffer"
          />
        </div>

        <div className="dropdown-group">
          <label>1st Target</label>
          <CornerDropdown
            value={cornerCase.first}
            onChange={(e) =>
              setCornerCase((prev) => ({
                ...prev,
                first: e.target.value,
              }))
            }
            placeholder="First"
          />
        </div>

        <div className="dropdown-group">
          <label>2nd Target</label>
          <CornerDropdown
            value={cornerCase.second}
            onChange={(e) =>
              setCornerCase((prev) => ({
                ...prev,
                second: e.target.value,
              }))
            }
            placeholder="Second"
          />
        </div>
        <button className="button-style" onClick={showInverse}>
          Invert
        </button>
      </div>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        algorithms && <AlgorithmList data={algorithms} />
      )}
    </>
  );
}
