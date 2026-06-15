import axios from 'axios';

const server = 'http://localhost:3000';

function toAlgId(id) {
  if (id == null) return id;
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id.$oid) return id.$oid;
  return String(id);
}

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

export async function deleteCustomAlg(id) {
  const token = sessionStorage.getItem("User");
  const algId = toAlgId(id);

  try {
    const response = await axios.delete(`${server}/algorithms/${algId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("DELETE ERROR STATUS:", error.response?.status);
    console.error("DELETE ERROR DATA:", error.response?.data);
    throw error;
  }
}