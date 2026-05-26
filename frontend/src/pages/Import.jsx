import { useState, useRef } from "react";
import {importAlgs} from "../BLDDBapi";

export function Import() {
  const [file, setFile] = useState();
  const [valid, setValid] = useState();
  const [duplicate, setDuplicate] = useState();
  const [invalid, setInvalid] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  const inputFile = useRef(null);


  const handleFile = (e) => {
    const file = e.target.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    if (fileExtension !== ".csv") {
      alert("Please upload a .csv file");
      inputFile.current.value = "";
      inputFile.current.type = "file";
      return;
    }
    setFile(file);
  };

  const submitFile = async () => {
    try{
      setErrorMessage("");
      let file = inputFile.current.files[0];
      if (!file) {
        alert("Please upload a file first");
        return;
      }
      let algorithms = parseCSV(await file.text());
      let response = await importAlgs(algorithms);
      setValid(response.validAlgorithms);
      setInvalid(response.invalidAlgorithms);
      setDuplicate(response.duplicateAlgorithms);
      }
    catch(error){
      setErrorMessage("Failed to Import");
    }
    
  };

  function parseCSV(csvText, delimiter = ",", minLength = 10) {
    if (typeof csvText !== "string" || csvText.length === 0) {
      return [];
    }

    const algorithms = [];
    let currentField = "";
    let currentRow = [];
    let inQuotes = false;

    function cleanValue(value) {
      if (typeof value !== "string") return "";

      let cleaned = value
        .replace(/^\uFEFF/, "") // remove BOM if present
        .replace(/[\0]/g, "") // remove null chars
        .trim();

      return cleaned;
    }

    function pushField() {
      const cleaned = cleanValue(currentField);
      currentRow.push(cleaned);
      currentField = "";
    }

    function pushRow() {
      if (currentRow.length === 0) return;

      for (const field of currentRow) {
        if (
          field &&
          field.length >= minLength &&
          field !== delimiter &&
          !/^[,\s]+$/.test(field)
        ) {
          algorithms.push(field);
        }
      }

      currentRow = [];
    }

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        pushField();
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        pushField();

        if (char === "\r" && nextChar === "\n") {
          i++;
        }

        pushRow();
      } else {
        currentField += char;
      }
    }

    // flush final field/row
    if (currentField.length > 0 || currentRow.length > 0) {
      pushField();
      pushRow();
    }

    return algorithms;
  }

  const hasUploadResults =
  valid?.length > 0 || duplicate?.length > 0;

  return (
    <div className="import-section">
      <div className="upload-card">
        <input
          type="file"
          onChange={handleFile}
          ref={inputFile}
        />
  
        <button
          className="button-style"
          onClick={submitFile}
        >
          Upload File
        </button>
      </div>
  
      {errorMessage ? (
        <div className="error-message">
          {errorMessage}
        </div>
      ) : (
        hasUploadResults && (
          <div className="results-section">
            <details className="result-dropdown">
              <summary>
                Successfully Imported Algorithms ({valid.length})
              </summary>
  
              <div className="result-content">
                {valid.map((alg, index) => (
                  <div key={index}>{alg}</div>
                ))}
              </div>
            </details>
  
            <details className="result-dropdown">
              <summary>
                Duplicate Algorithms ({duplicate.length})
              </summary>
  
              <div className="result-content">
                {duplicate.map((alg, index) => (
                  <div key={index}>{alg}</div>
                ))}
              </div>
            </details>

          </div>
        )
      )}
    </div>
  );
}