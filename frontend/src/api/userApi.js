import axios from "axios";

const server = "http://localhost:3000";

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
   return axios.post(`${server}/users`, user);
}

export async function verifyUser(user) {
   return axios.post(`${server}/users/login`, user);
}

export async function getCurrentUser() {
   return axios.get(`${server}/users/me`, {
      headers: getAuthHeaders(),
   });
}

export async function updateCurrentUserLetterScheme(letterScheme) {
   return axios.patch(
      `${server}/users/me/letter-scheme`,
      { letterScheme },
      {
         headers: getAuthHeaders(),
      },
   );
}