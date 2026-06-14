import axios from 'axios';

const server = 'http://localhost:3000';

export async function getCustomAlgs() {
  const token = sessionStorage.getItem("User");

  const response = await axios.get(`${server}/algorithms`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
}

export async function createNewCustomAlg(alg) {
  const token = sessionStorage.getItem("User");

  const response = await axios.post(`${server}/algorithms`, alg, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
}

export async function getCustomAlg(id) {
  return axios.get(`${server}/algorithms/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("User")}`,
    },
  });
}

export async function updateCustomAlg(id, alg) {
  return axios.put(`${server}/algorithms/${id}`, alg, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("User")}`,
    },
  });
}