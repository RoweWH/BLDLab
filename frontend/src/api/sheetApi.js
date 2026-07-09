import axios from "axios";
import { NODE_API_URL } from "./apiConfig";

function getAuthHeader() {
   return {
      Authorization: `Bearer ${sessionStorage.getItem("User")}`,
   };
}

export async function getSheets() {
   return axios.get(`${NODE_API_URL}/sheets`, {
      headers: getAuthHeader(),
   });
}

export async function createNewSheet(sheet) {
   return axios.post(`${NODE_API_URL}/sheets`, sheet, {
      headers: getAuthHeader(),
   });
}

export async function getSheet(id) {
   return axios.get(`${NODE_API_URL}/sheets/${id}`);
}

export async function updateSheet(id, sheet) {
   return axios.put(`${NODE_API_URL}/sheets/${id}`, sheet, {
      headers: getAuthHeader(),
   });
}

export async function deleteSheet(sheetId) {
   return axios.delete(`${NODE_API_URL}/sheets/${sheetId}`, {
      headers: getAuthHeader(),
   });
}