import axios from "axios";
import { BLDDB_API_URL } from "./apiConfig";

export async function getAllEdgeCases() {
   return axios.get(`${BLDDB_API_URL}/edges/cases`);
}

export async function getEdgeCasesByBuffer(buffer) {
   return axios.get(`${BLDDB_API_URL}/edges/cases?buffer=${buffer}`);
}

export async function getEdgeAlgs(buffer, first, second) {
   return axios.get(
      `${BLDDB_API_URL}/edges/cases?buffer=${buffer}&first=${first}&second=${second}`,
   );
}

export async function getEdgeAlgsByCaseId(caseId) {
   return axios.get(`${BLDDB_API_URL}/edges/cases/${caseId}/algorithms`);
}

export async function getEdgeAlgById(id) {
   return axios.get(`${BLDDB_API_URL}/edges/algorithms/${id}`);
}

export async function getAllCornerCases() {
   return axios.get(`${BLDDB_API_URL}/corners/cases`);
}

export async function getCornerCasesByBuffer(buffer) {
   return axios.get(`${BLDDB_API_URL}/corners/cases?buffer=${buffer}`);
}

export async function getCornerAlgs(buffer, first, second) {
   return axios.get(
      `${BLDDB_API_URL}/corners/cases?buffer=${buffer}&first=${first}&second=${second}`,
   );
}

export async function getCornerAlgsByCaseId(caseId) {
   return axios.get(`${BLDDB_API_URL}/corners/cases/${caseId}/algorithms`);
}

export async function getCornerAlgById(id) {
   return axios.get(`${BLDDB_API_URL}/corners/algorithms/${id}`);
}

export async function getAllParityCases() {
   return axios.get(`${BLDDB_API_URL}/parity/cases`);
}

export async function getParityAlgs(
   firstEdge,
   secondEdge,
   firstCorner,
   secondCorner,
   twist,
) {
   const url =
      `${BLDDB_API_URL}/parity/cases` +
      `?firstEdge=${firstEdge}` +
      `&secondEdge=${secondEdge}` +
      `&firstCorner=${firstCorner}` +
      `&secondCorner=${secondCorner}` +
      `&twist=${twist ?? ""}`;

   return axios.get(url);
}

export async function getParityAlgsByCaseId(caseId) {
   return axios.get(`${BLDDB_API_URL}/parity/cases/${caseId}/algorithms`);
}

export async function getParityAlgById(id) {
   return axios.get(`${BLDDB_API_URL}/parity/algorithms/${id}`);
}

export async function importAlgs(algorithms) {
   const response = await axios.post(`${BLDDB_API_URL}/import`, algorithms);
   return response?.data;
}

export async function verifyAlg(submission, type) {
   const apiType = ["t2c", "ltct", "2e2c"].includes(type.toLowerCase())
      ? "parity"
      : type.toLowerCase();

   const response = await axios.post(
      `${BLDDB_API_URL}/${apiType}/algorithms/verify`,
      submission,
   );

   return response?.data;
}

export async function insertEdgeAlg(submission) {
   const response = await axios.post(
      `${BLDDB_API_URL}/edges/algorithms`,
      submission,
   );

   return response.data;
}

export async function insertCornerAlg(submission) {
   const response = await axios.post(
      `${BLDDB_API_URL}/corners/algorithms`,
      submission,
   );

   return response.data;
}

export async function insertParityAlg(submission) {
   const response = await axios.post(
      `${BLDDB_API_URL}/parity/algorithms`,
      submission,
   );

   return response.data;
}