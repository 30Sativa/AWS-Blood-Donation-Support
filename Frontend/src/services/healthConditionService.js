import api from "./api";

// Get all health conditions
export const getHealthConditions = async () => {
  const res = await api.get("/HealthConditions");
  return res.data;
};
