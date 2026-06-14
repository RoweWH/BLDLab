import axios from "axios";

const BLDDB = "https://rowewh.com/api";


// ==========================
// EDGES
// ==========================

// GET /api/edges/cases
export async function getAllEdgeCases() {
  const response = await axios.get(`${BLDDB}/edges/cases`);
  return response;
}

// GET /api/edges/cases?buffer=UF
export async function getEdgeCasesByBuffer(buffer) {
  const response = await axios.get(
    `${BLDDB}/edges/cases?buffer=${buffer}`
  );

  return response;
}

// GET /api/edges/cases?buffer=UF&first=UR&second=UB
export async function getEdgeAlgs(buffer, first, second) {
  const response = await axios.get(
    `${BLDDB}/edges/cases?buffer=${buffer}&first=${first}&second=${second}`
  );

  return response;
}

// GET /api/edges/cases/{caseId}/algorithms
export async function getEdgeAlgsByCaseId(caseId) {
  const response = await axios.get(
    `${BLDDB}/edges/cases/${caseId}/algorithms`
  );

  return response;
}

// GET /api/edges/algorithms/{algorithmId}
export async function getEdgeAlgById(id) {
  const response = await axios.get(
    `${BLDDB}/edges/algorithms/${id}`
  );

  return response;
}

// POST /api/edges/algorithms
export async function insertEdgeAlg(algObject) {
  const response = await axios.post(
    `${BLDDB}/edges/algorithms`,
    algObject
  );

  return response.data;
}


// ==========================
// CORNERS
// ==========================

// GET /api/corners/cases
export async function getAllCornerCases() {
  const response = await axios.get(`${BLDDB}/corners/cases`);
  return response;
}

// GET /api/corners/cases?buffer=UFR
export async function getCornerCasesByBuffer(buffer) {
  const response = await axios.get(
    `${BLDDB}/corners/cases?buffer=${buffer}`
  );

  return response;
}

// GET /api/corners/cases?buffer=UFR&first=UBR&second=UFL
export async function getCornerAlgs(buffer, first, second) {
  const response = await axios.get(
    `${BLDDB}/corners/cases?buffer=${buffer}&first=${first}&second=${second}`
  );

  return response;
}

// GET /api/corners/cases/{caseId}/algorithms
export async function getCornerAlgsByCaseId(caseId) {
  const response = await axios.get(
    `${BLDDB}/corners/cases/${caseId}/algorithms`
  );

  return response;
}

// GET /api/corners/algorithms/{algorithmId}
export async function getCornerAlgById(id) {
  const response = await axios.get(
    `${BLDDB}/corners/algorithms/${id}`
  );

  return response;
}

// POST /api/corners/algorithms
export async function insertCornerAlg(algObject) {
  const response = await axios.post(
    `${BLDDB}/corners/algorithms`,
    algObject
  );

  return response.data;
}


// ==========================
// PARITY
// ==========================

// GET /api/parity/cases
export async function getAllParityCases() {
  const response = await axios.get(`${BLDDB}/parity/cases`);
  return response;
}

// GET /api/parity/cases?firstEdge=...
export async function getParityAlgs(
  firstEdge,
  secondEdge,
  firstCorner,
  secondCorner,
  twist
) {
  const url =
    `${BLDDB}/parity/cases` +
    `?firstEdge=${firstEdge}` +
    `&secondEdge=${secondEdge}` +
    `&firstCorner=${firstCorner}` +
    `&secondCorner=${secondCorner}` +
    `&twist=${twist ?? ""}`;

  const response = await axios.get(url);

  return response;
}

// GET /api/parity/cases/{caseId}/algorithms
export async function getParityAlgsByCaseId(caseId) {
  const response = await axios.get(
    `${BLDDB}/parity/cases/${caseId}/algorithms`
  );

  return response;
}

// GET /api/parity/algorithms/{algorithmId}
export async function getParityAlgById(id) {
  const response = await axios.get(
    `${BLDDB}/parity/algorithms/${id}`
  );

  return response;
}

// POST /api/parity/algorithms
export async function insertParityAlg(algObject) {
  const response = await axios.post(
    `${BLDDB}/parity/algorithms`,
    algObject
  );

  return response.data;
}


// ==========================
// SHARED
// ==========================

// POST /api/import
export async function importAlgs(algorithms) {
  const response = await axios.post(
    `${BLDDB}/import`,
    algorithms
  );

  return response?.data;
}


// POST /api/{type}/algorithms/verify
export async function verifyAlg(submission, type) {
  const apiType =
    type.toLowerCase() === "t2c"
      ? "ltct"
      : type.toLowerCase();

  const response = await axios.post(
    `${BLDDB}/${apiType}/algorithms/verify`,
    submission
  );

  return response?.data;
}