import { useRef, useState } from "react";
import { importAlgs } from "../../api/algApi";
import "./Import.css";

export function Import() {
  const [fileName, setFileName] = useState("");
  const [valid, setValid] = useState([]);
  const [duplicate, setDuplicate] = useState([]);
  const [invalid, setInvalid] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const inputFile = useRef(null);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    clearResults();

    if (!selectedFile) {
      setFileName("");
      return;
    }

    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (fileExtension !== ".csv") {
      setErrorMessage("Please upload a .csv file.");
      setFileName("");
      resetFileInput();
      return;
    }

    setFileName(selectedFile.name);
  };

  const submitFile = async () => {
    const selectedFile = inputFile.current?.files?.[0];

    if (!selectedFile) {
      setErrorMessage("Please upload a CSV file first.");
      return;
    }

    try {
      setIsImporting(true);
      clearResults();

      const csvText = await selectedFile.text();
      const algorithms = parseCSV(csvText);

      if (algorithms.length === 0) {
        setErrorMessage("No algorithms were found in the selected CSV file.");
        return;
      }

      const response = await importAlgs(algorithms);

      setValid(response.validAlgorithms);
      setDuplicate(response.duplicateAlgorithms);
      setInvalid(response.invalidAlgorithms);

      const processedCount =
        response.validAlgorithms.length +
        response.duplicateAlgorithms.length +
        response.invalidAlgorithms.length;

      console.log("Import results:", {
        submitted: algorithms.length,
        processed: processedCount,
        valid: response.validAlgorithms.length,
        duplicate: response.duplicateAlgorithms.length,
        invalid: response.invalidAlgorithms.length,
      });

      if (processedCount !== algorithms.length) {
        setErrorMessage(
          `Submitted ${algorithms.length} algorithms, but the server returned results for ${processedCount}.`,
        );
      }
    } catch (error) {
      console.error("Algorithm import failed:", error);

      const responseData = error.response?.data;

      if (typeof responseData === "string") {
        setErrorMessage(responseData);
      } else if (responseData?.message) {
        setErrorMessage(responseData.message);
      } else {
        setErrorMessage("Failed to import algorithms.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const clearResults = () => {
    setValid([]);
    setDuplicate([]);
    setInvalid([]);
    setErrorMessage("");
  };

  const resetFileInput = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
    }
  };

  function parseCSV(csvText, delimiter = ",", minLength = 10) {
    if (typeof csvText !== "string" || csvText.trim().length === 0) {
      return [];
    }

    const algorithms = [];

    let currentField = "";
    let currentRow = [];
    let inQuotes = false;

    function cleanValue(value) {
      if (typeof value !== "string") {
        return "";
      }

      return value
        .replace(/^\uFEFF/, "")
        .replace(/\0/g, "")
        .trim();
    }

    function pushField() {
      currentRow.push(cleanValue(currentField));
      currentField = "";
    }

    function pushRow() {
      if (currentRow.length === 0) {
        return;
      }

      for (const field of currentRow) {
        const isValidField =
          field.length >= minLength &&
          field !== delimiter &&
          !/^[,\s]+$/.test(field);

        if (isValidField) {
          algorithms.push(field);
        }
      }

      currentRow = [];
    }

    for (let index = 0; index < csvText.length; index++) {
      const character = csvText[index];
      const nextCharacter = csvText[index + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          currentField += '"';
          index++;
        } else {
          inQuotes = !inQuotes;
        }

        continue;
      }

      if (character === delimiter && !inQuotes) {
        pushField();
        continue;
      }

      if ((character === "\n" || character === "\r") && !inQuotes) {
        pushField();

        if (character === "\r" && nextCharacter === "\n") {
          index++;
        }

        pushRow();
        continue;
      }

      currentField += character;
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      pushField();
      pushRow();
    }

    return algorithms;
  }

  const hasUploadResults =
    valid.length > 0 || duplicate.length > 0 || invalid.length > 0;

  const totalProcessed = valid.length + duplicate.length + invalid.length;

  return (
    <div className="import-section">
      <div className="upload-card">
        <input
          ref={inputFile}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={isImporting}
        />

        {fileName && <div className="selected-file">{fileName}</div>}

        <button
          className="button-style"
          type="button"
          onClick={submitFile}
          disabled={isImporting}
        >
          {isImporting ? "Importing..." : "Upload File"}
        </button>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {hasUploadResults && (
        <div className="results-section">
          <div className="import-summary">
            Processed Algorithms: {totalProcessed}
          </div>

          <details className="result-dropdown">
            <summary>Successfully Imported Algorithms ({valid.length})</summary>

            <div className="result-content">
              {valid.map((alg, index) => (
                <div key={`${alg.id}-${index}`}>
                  {alg.id}: {alg.algorithm}
                </div>
              ))}
            </div>
          </details>

          <details className="result-dropdown">
            <summary>Duplicate Algorithms ({duplicate.length})</summary>

            <div className="result-content">
              {duplicate.map((alg, index) => (
                <div key={`${alg}-${index}`}>{alg}</div>
              ))}
            </div>
          </details>

          <details className="result-dropdown">
            <summary>Invalid Algorithms ({invalid.length})</summary>

            <div className="result-content">
              {invalid.map((alg, index) => (
                <div key={`${alg}-${index}`}>{alg}</div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
