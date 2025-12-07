import api from "./api";

// Get all blood types
export const getBloodTypes = async () => {
  const res = await api.get("/BloodTypes");
  return res.data;
};
