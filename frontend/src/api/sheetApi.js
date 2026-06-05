import axios from 'axios';

const server = 'http://localhost:3000';

export async function getSheets() {
  const token = sessionStorage.getItem("User");

  const response = await axios.get(`${server}/sheets`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
}

export async function createNewSheet(sheet) {
  const token = sessionStorage.getItem("User");

  const response = await axios.post(`${server}/sheets`, sheet, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
}

export async function getSheet(id) {
   const response = await axios.get(`${server}/sheets/${id}`);
   return response;
}