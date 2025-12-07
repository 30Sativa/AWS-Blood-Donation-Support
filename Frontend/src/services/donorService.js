import api from "./api";

// Get current user's donor information
export const getMyDonor = async () => {
  const res = await api.get("/Donors/me");
  return res.data;
};

// Register as a donor
export const registerDonor = async (donorData) => {
  const res = await api.post("/Donors/register", donorData);
  return res.data;
};

// Get donor by ID (if needed)
export const getDonorById = async (donorId) => {
  const res = await api.get(`/Donors/${donorId}`);
  return res.data;
};

// Update donor information
export const updateDonor = async (donorId, donorData) => {
  const res = await api.put(`/Donors/${donorId}`, donorData);
  return res.data;
};

// Update donor ready status
export const updateDonorStatus = async (donorId, isReady) => {
  const res = await api.put(`/Donors/${donorId}/ready-status`, { isReady });
  return res.data;
};

// Search nearby donors
export const searchNearbyDonors = async (latitude, longitude, radiusKm) => {
  const res = await api.get(
    `/Donors/nearby?Latitude=${latitude}&Longitude=${longitude}&RadiusKm=${radiusKm}`
  );
  return res.data;
};
