import { useEffect, useState } from "react";
import { getEdgeAlgs } from "../api/algApi";
import { EdgeDropdown } from "../components/selectors/EdgeDropdown";
import { AlgorithmList } from "../components/ui/AlgorithmList";

export function Edges() {
  const [edgeCase, setEdgeCase] = useState({
    buffer: "",
    first: "",
    second: "",
  });

  const [error, setError] = useState("");

  const [algorithms, setAlgorithms] = useState();

  useEffect(() => {
    if (!edgeCase.buffer || !edgeCase.first || !edgeCase.second) {
      setAlgorithms(null);
      setError("");
      return;
    }

    async function loadAlgorithms() {
      try {
        setError("");
        const response = await getEdgeAlgs(
          edgeCase.buffer,
          edgeCase.first,
          edgeCase.second,
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
  }, [edgeCase.buffer, edgeCase.first, edgeCase.second]);

  const showInverse = () => {
    setEdgeCase((prev) => ({
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
          <EdgeDropdown
            value={edgeCase.buffer}
            onChange={(e) =>
              setEdgeCase((prev) => ({
                ...prev,
                buffer: e.target.value,
              }))
            }
            placeholder="Buffer"
          />
        </div>

        <div className="dropdown-group">
          <label>1st Target</label>
          <EdgeDropdown
            value={edgeCase.first}
            onChange={(e) =>
              setEdgeCase((prev) => ({
                ...prev,
                first: e.target.value,
              }))
            }
            placeholder="First"
          />
        </div>

        <div className="dropdown-group">
          <label>2nd Target</label>
          <EdgeDropdown
            value={edgeCase.second}
            onChange={(e) =>
              setEdgeCase((prev) => ({
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
