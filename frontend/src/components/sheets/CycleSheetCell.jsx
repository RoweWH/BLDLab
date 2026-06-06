import { useEffect, useState } from "react";
import {
  getEdgeAlgById,
  getCornerAlgById,
  getParityAlgById,
} from "../../api/algApi";

export function CycleSheetCell({ cell, type }) {
  const [primaryAlg, setPrimaryAlg] = useState("");

  const primary = cell.algorithms?.find((alg) => alg.primary);

  useEffect(() => {
    async function loadAlg() {
      if (!primary) {
        setPrimaryAlg("");
        return;
      }

      try {
        let response;

        if (type === "edges") {
          response = await getEdgeAlgById(primary.algorithm);
        } else if (type === "corners") {
          response = await getCornerAlgById(primary.algorithm);
        } else if (type === "2e2c") {
          response = await getParityAlgById(primary.algorithm);
        } else {
          setPrimaryAlg("");
          return;
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
  }, [primary?.algorithm, type]);

  return <div className="cycle-sheet-cell">{primaryAlg}</div>;
}
