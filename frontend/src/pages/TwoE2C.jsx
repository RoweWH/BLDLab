import { useEffect, useState } from "react";
import { getParityAlgs } from "../BLDDBapi";
import { EdgeDropdown } from "../components/selectors/EdgeDropdown";
import { CornerDropdown } from "../components/selectors/CornerDropdown";
import { AlgorithmList } from "../components/AlgorithmList";

export function TwoE2C() {
  const [parityCase, setParityCase] = useState({
    firstEdge: "",
    secondEdge: "",
    firstCorner: "",
    secondCorner: "",
    twist: "",
  });

  const [error, setError] = useState("");
  const [algorithms, setAlgorithms] = useState();

  useEffect(() => {
    if (
      !parityCase.firstEdge ||
      !parityCase.secondEdge ||
      !parityCase.firstCorner ||
      !parityCase.secondCorner
    ) {
      setAlgorithms(null);
      setError("");
      return;
    }

    async function loadAlgorithms() {
      try {
        setError("");

        const response = await getParityAlgs(
          parityCase.firstEdge,
          parityCase.secondEdge,
          parityCase.firstCorner,
          parityCase.secondCorner,
          null,
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
  }, [
    parityCase.firstEdge,
    parityCase.secondEdge,
    parityCase.firstCorner,
    parityCase.secondCorner,
  ]);

  return (
    <>
      <div className="selectors">
        <div className="dropdown-pair">
          <label>Edge Swap</label>

          <div className="pair-selectors">
            <EdgeDropdown
              value={parityCase.firstEdge}
              onChange={(e) =>
                setParityCase((prev) => ({
                  ...prev,
                  firstEdge: e.target.value,
                }))
              }
              placeholder="First Edge"
            />

            <EdgeDropdown
              value={parityCase.secondEdge}
              onChange={(e) =>
                setParityCase((prev) => ({
                  ...prev,
                  secondEdge: e.target.value,
                }))
              }
              placeholder="Second Edge"
            />
          </div>
        </div>

        <div className="dropdown-pair">
          <label>Corner Swap</label>

          <div className="pair-selectors">
            <CornerDropdown
              value={parityCase.firstCorner}
              onChange={(e) =>
                setParityCase((prev) => ({
                  ...prev,
                  firstCorner: e.target.value,
                }))
              }
              placeholder="First Corner"
            />

            <CornerDropdown
              value={parityCase.secondCorner}
              onChange={(e) =>
                setParityCase((prev) => ({
                  ...prev,
                  secondCorner: e.target.value,
                }))
              }
              placeholder="Second Corner"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        algorithms && <AlgorithmList data={algorithms} />
      )}
    </>
  );
}
