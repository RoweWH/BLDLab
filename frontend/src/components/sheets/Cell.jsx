import { useEffect, useState } from "react";
import {
  getEdgeAlgById,
  getCornerAlgById,
  getParityAlgById,
} from "../../api/algApi";

export function Cell({ cell, type }) {
  const [primaryAlg, setPrimaryAlg] = useState("");

  const primaryAlgorithmId = cell.algorithms?.find(
    (alg) => alg.primary,
  )?.algorithm;

  useEffect(() => {
    async function loadAlg() {
      if (!primaryAlgorithmId) {
        setPrimaryAlg("");
        return;
      }

      try {
        let response;

        if (type === "edges") {
          response = await getEdgeAlgById(primaryAlgorithmId);
        } else if (type === "corners") {
          response = await getCornerAlgById(primaryAlgorithmId);
        } else {
          response = await getParityAlgById(primaryAlgorithmId);
        }

        const algText =
          response.data.algorithm ?? response.data.Algorithm ?? response.data;

        setPrimaryAlg(algText);
      } catch (error) {
        console.error("Failed to load alg:", error);
        setPrimaryAlg("");
      }
    }

    loadAlg();
  }, [primaryAlgorithmId, type]);

  if (!cell.algorithms) {
    return <div className="cycle-sheet-cell cycle-sheet-cell--invalid" />;
  }

  return <div className="cycle-sheet-cell">{primaryAlg}</div>;
}
