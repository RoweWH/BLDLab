import { useState, useRef } from "react";
import {importAlgs} from "../BLDDBapi";

export function ImportPage() {
  const [file, setFile] = useState();

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
    let file = inputFile.current.files[0];
    if (!file) {
      alert("Please upload a file first");
      return;
    }
    let algorithms = parseCSV(await file.text());
    console.log(algorithms);
    console.log(await importAlgs(algorithms));
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

  return (
    <>
      <section id="center">
        <input type="file" onChange={handleFile} ref={inputFile}></input>
        <button className="counter" onClick={submitFile}>
          Upload File
        </button>
      </section>
    </>
  );
}