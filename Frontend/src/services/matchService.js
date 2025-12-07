import api from "./api";

// Get all matches
export const getAllMatches = async () => {
  const res = await api.get("/Matches");
  return res.data;
};

// Get match by ID
export const getMatchById = async (matchId) => {
  const res = await api.get(`/Matches/${matchId}`);
  return res.data;
};

// Create a new match
export const createMatch = async (matchData) => {
  const res = await api.post("/Matches", matchData);
  return res.data;
};

// Get matches by request ID
export const getMatchesByRequestId = async (requestId) => {
  const res = await api.get(`/Matches?requestId=${requestId}`);
  return res.data;
};

