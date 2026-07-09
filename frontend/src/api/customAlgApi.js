import axios from "axios";
import { NODE_API_URL } from "./apiConfig";

function getAuthHeader() {
   return {
      Authorization: `Bearer ${sessionStorage.getItem("User")}`,
   };
}

function toAlgId(id) {
   if (id == null) return id;
   if (typeof id === "string") return id;
   if (typeof id === "object" && id.$oid) return id.$oid;
   return String(id);
}

export async function getCustomAlgs() {
   return axios.get(`${NODE_API_URL}/algorithms`, {
      headers: getAuthHeader(),
   });
}

export async function createNewCustomAlg(alg) {
   return axios.post(`${NODE_API_URL}/algorithms`, alg, {
      headers: getAuthHeader(),
   });
}

export async function getCustomAlg(id) {
   return axios.get(`${NODE_API_URL}/algorithms/${id}`, {
      headers: getAuthHeader(),
   });
}

export async function updateCustomAlg(id, alg) {
   return axios.put(`${NODE_API_URL}/algorithms/${id}`, alg, {
      headers: getAuthHeader(),
   });
}

export async function deleteCustomAlg(id) {
   const algId = toAlgId(id);

   return axios.delete(`${NODE_API_URL}/algorithms/${algId}`, {
      headers: getAuthHeader(),
   });
}