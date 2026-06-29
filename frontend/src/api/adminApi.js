import axios from "axios";

const server = "http://localhost:3000";

function getAuthHeader() {
  return {
    Authorization: `Bearer ${sessionStorage.getItem("User")}`,
  };
}

export async function getPendingAlgorithms() {
  return axios.get(`${server}/admin/algorithms`, {
    headers: getAuthHeader(),
  });
}

export async function updateAdminAlgorithmStatus(
  id,
  status,
  BLDLabId = null,
) {
  const algId =
    typeof id === "object"
      ? id.$oid ?? id.toString()
      : id;

  const response = await axios.put(
    `${server}/admin/algorithms/${algId}/status`,
    {
      status,
      BLDLabId,
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("User")}`,
      },
    },
  );

  return response;
}