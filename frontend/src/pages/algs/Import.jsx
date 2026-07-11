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
  const [submittedCount, setSubmittedCount] = useState(0);

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
      const parseResult = parseCSV(csvText);
      const algorithms = parseResult.algorithms;

      setSubmittedCount(algorithms.length);

      runParserDiagnostics({
        csvText,
        algorithms,
        parseResult,
      });

      if (algorithms.length === 0) {
        setErrorMessage("No values were found in the selected CSV file.");
        return;
      }

      const response = await importAlgs(algorithms);

      const validAlgorithms = response.validAlgorithms ?? [];
      const duplicateAlgorithms = response.duplicateAlgorithms ?? [];
      const invalidAlgorithms = response.invalidAlgorithms ?? [];

      setValid(validAlgorithms);
      setDuplicate(duplicateAlgorithms);
      setInvalid(invalidAlgorithms);

      const processedCount =
        validAlgorithms.length +
        duplicateAlgorithms.length +
        invalidAlgorithms.length;

      console.group("Import results");
      console.log("Submitted:", algorithms.length);
      console.log("Processed:", processedCount);
      console.log("Valid:", validAlgorithms.length);
      console.log("Duplicate:", duplicateAlgorithms.length);
      console.log("Invalid:", invalidAlgorithms.length);
      console.log("Full API response:", response);
      console.groupEnd();

      if (processedCount !== algorithms.length) {
        setErrorMessage(
          `Submitted ${algorithms.length} values, but the API returned results for ${processedCount}.`,
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
    setSubmittedCount(0);
    setErrorMessage("");
  };

  const resetFileInput = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
    }
  };

  function parseCSV(csvText, delimiter = ",") {
    if (typeof csvText !== "string" || csvText.trim().length === 0) {
      return {
        algorithms: [],
        totalFields: 0,
        emptyFields: 0,
        rows: 0,
      };
    }

    const algorithms = [];

    let currentField = "";
    let currentRow = [];
    let inQuotes = false;

    let totalFields = 0;
    let emptyFields = 0;
    let rows = 0;

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
      const cleaned = cleanValue(currentField);

      currentRow.push(cleaned);
      currentField = "";
      totalFields++;

      if (!cleaned) {
        emptyFields++;
      }
    }

    function pushRow() {
      if (currentRow.length === 0) {
        return;
      }

      rows++;

      for (const field of currentRow) {
        const isNonEmptyValue =
          field.length > 0 && field !== delimiter && !/^[,\s]+$/.test(field);

        if (isNonEmptyValue) {
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

    return {
      algorithms,
      totalFields,
      emptyFields,
      rows,
    };
  }

  function runParserDiagnostics({ csvText, algorithms, parseResult }) {
    const nonEmptyLines = csvText
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const duplicateValues = algorithms.filter(
      (algorithm, index) => algorithms.indexOf(algorithm) !== index,
    );

    const uniqueDuplicateValues = [...new Set(duplicateValues)];

    const veryShortValues = algorithms.filter((value) => value.length < 10);

    console.group("CSV parser diagnostics");
    console.log("Non-empty lines:", nonEmptyLines.length);
    console.log("Rows parsed:", parseResult.rows);
    console.log("Total fields:", parseResult.totalFields);
    console.log("Empty fields:", parseResult.emptyFields);
    console.log("Submitted values:", algorithms.length);
    console.log("Values shorter than 10 characters:", veryShortValues.length);

    if (veryShortValues.length > 0) {
      console.log("Short values:", veryShortValues);
    }

    console.log("Duplicate values inside CSV:", uniqueDuplicateValues.length);

    if (uniqueDuplicateValues.length > 0) {
      console.log("CSV duplicate values:", uniqueDuplicateValues);
    }

    console.log("All submitted values:", algorithms);
    console.groupEnd();

    console.assert(
      parseResult.totalFields >= algorithms.length,
      "Parser test failed: submitted values exceed total parsed fields.",
    );

    console.assert(
      algorithms.every(
        (value) => typeof value === "string" && value.trim().length > 0,
      ),
      "Parser test failed: algorithms contains an empty or non-string value.",
    );

    console.assert(
      !algorithms.some((value) => value.includes("\0")),
      "Parser test failed: a null character remained in the parsed data.",
    );
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
            Submitted Algorithms: {submittedCount}
          </div>

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
