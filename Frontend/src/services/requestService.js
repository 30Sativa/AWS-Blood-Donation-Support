import api from "./api";

// Get current user's requests
export const getMyRequests = async () => {
  const res = await api.get("/Requests/me");
  return res.data;
};

// Get request by ID
export const getRequestById = async (requestId) => {
  const res = await api.get(`/Requests/${requestId}`);
  return res.data;
};

// Create a new request
export const createRequest = async (requestData) => {
  const res = await api.post("/Requests", requestData);
  return res.data;
};

// Register a new request
export const registerRequest = async (requestData) => {
  const res = await api.post("/Requests/register", requestData);
  return res.data;
};

// Cancel a request
export const cancelRequest = async (requestId) => {
  // POST with empty object body (as Swagger shows it works)
  const res = await api.post(`/Requests/${requestId}/cancel`, {});
  return res.data;
};

// Get all requests (for Staff) with pagination
export const getAllRequests = async (pageNumber = 1, pageSize = 10) => {
  try {
    const res = await api.get(`/Requests?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    console.log("API Response:", res);
    console.log("API Response Data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error in getAllRequests:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};