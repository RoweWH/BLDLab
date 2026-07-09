import axios from "axios";
import { NODE_API_URL } from "./apiConfig";

function getAuthHeader() {
   return {
      Authorization: `Bearer ${sessionStorage.getItem("User")}`,
   };
}

export async function getPendingAlgorithms() {
   return axios.get(`${NODE_API_URL}/admin/algorithms`, {
      headers: getAuthHeader(),
   });
}

export async function updateAdminAlgorithmStatus(id, status, BLDLabId = null) {
   const algId = typeof id === "object" ? id.$oid ?? id.toString() : id;

   return axios.put(
      `${NODE_API_URL}/admin/algorithms/${algId}/status`,
      {
         status,
         BLDLabId,
      },
      {
         headers: getAuthHeader(),
      },
   );
}