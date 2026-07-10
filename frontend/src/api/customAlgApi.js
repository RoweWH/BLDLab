import axios from "axios";
import { NODE_API_URL } from "./apiConfig";

function getAuthHeader() {
  return {
    Authorization: `Bearer ${sessionStorage.getItem("User")}`,
  };
}

function toAlgId(id) {
  if (id == null) {
    return id;
  }

  if (typeof id === "string") {
    return id;
  }

  if (typeof id === "object" && id.$oid) {
    return id.$oid;
  }

  return String(id);
}

/*
 * Logged-in algorithm API
 */

export async function getCustomAlgs() {
  return axios.get(`${NODE_API_URL}/algorithms`, {
    headers: getAuthHeader(),
  });
}

export async function createNewCustomAlg(algorithm) {
  return axios.post(`${NODE_API_URL}/algorithms`, algorithm, {
    headers: getAuthHeader(),
  });
}

export async function getCustomAlg(id) {
  return axios.get(
    `${NODE_API_URL}/algorithms/${toAlgId(id)}`,
    {
      headers: getAuthHeader(),
    },
  );
}

export async function updateCustomAlg(id, algorithm) {
  return axios.put(
    `${NODE_API_URL}/algorithms/${toAlgId(id)}`,
    algorithm,
    {
      headers: getAuthHeader(),
    },
  );
}

export async function deleteCustomAlg(id) {
  return axios.delete(
    `${NODE_API_URL}/algorithms/${toAlgId(id)}`,
    {
      headers: getAuthHeader(),
    },
  );
}

/*
 * Guest submission API
 */

export async function createGuestAlgorithmSubmission(algorithm) {
  return axios.post(
    `${NODE_API_URL}/algorithms/guest`,
    algorithm,
  );
}

export async function updateGuestAlgorithmSubmission(
  submissionId,
  submissionKey,
  algorithm,
) {
  return axios.put(
    `${NODE_API_URL}/algorithms/guest/${toAlgId(submissionId)}`,
    {
      ...algorithm,
      submissionKey,
    },
  );
}

export async function deleteGuestAlgorithmSubmission(
  submissionId,
  submissionKey,
) {
  return axios.delete(
    `${NODE_API_URL}/algorithms/guest/${toAlgId(submissionId)}`,
    {
      data: {
        submissionKey,
      },
    },
  );
}

export async function getGuestSubmissionStatuses(submissionIds) {
  return axios.post(
    `${NODE_API_URL}/algorithms/guest/status`,
    {
      submissionIds: submissionIds.map(toAlgId),
    },
  );
}