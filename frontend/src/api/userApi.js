import axios from 'axios';

const server = 'http://localhost:3000';

export async function createUser(user) {
   const response = await axios.post(`${server}/users`, user)
   return response;
}

export async function verifyUser(user) {
   const response = await axios.post(`${server}/users/login`, user)
   return response;
}

export async function getCurrentUser() {
  const token = sessionStorage.getItem("User");

  const response = await axios.get(`${server}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}