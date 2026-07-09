import axios from "axios";
import { NODE_API_URL } from "./apiConfig";

function getAuthHeaders() {
   const token = sessionStorage.getItem("User");

   if (!token) {
      throw new Error("No auth token found");
   }

   return {
      Authorization: `Bearer ${token}`,
   };
}

export async function createUser(user) {
   return axios.post(`${NODE_API_URL}/users`, user);
}

export async function verifyUser(user) {
   return axios.post(`${NODE_API_URL}/users/login`, user);
}

export async function getCurrentUser() {
   return axios.get(`${NODE_API_URL}/users/me`, {
      headers: getAuthHeaders(),
   });
}

export async function updateCurrentUserLetterScheme(letterScheme) {
   return axios.patch(
      `${NODE_API_URL}/users/me/letter-scheme`,
      { letterScheme },
      {
         headers: getAuthHeaders(),
      },
   );
}