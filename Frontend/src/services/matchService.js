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

// Mark match as contacted
export const markMatchAsContacted = async (matchId) => {
  const res = await api.put(`/Matches/${matchId}/contact`);
  return res.data;
};

// Get my matches (for member)
export const getMyMatches = async () => {
  const res = await api.get("/Matches/me");
  return res.data;
};

// Accept a match
export const acceptMatch = async (matchId) => {
  const res = await api.put(`/Matches/${matchId}/accept`);
  return res.data;
};

// Decline a match
export const declineMatch = async (matchId) => {
  const res = await api.put(`/Matches/${matchId}/decline`);
  return res.data;
};

