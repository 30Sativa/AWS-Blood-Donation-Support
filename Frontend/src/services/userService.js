import api from "./api";

export const getUserProfile = async () => {
  const res = await api.get("/Users/me");
  return res.data;
};

// Confirm email
export const confirmEmail = async (email, verificationCode) => {
  const res = await api.post("/Users/confirm-email", {
    email,
    verificationCode,
  });
  return res.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const res = await api.post("/Users/forgot-password", {
    email,
  });
  return res.data;
};

// Reset password
export const resetPassword = async (email, newPassword, confirmationCode) => {
  const res = await api.post("/Users/reset-password", {
    request: {
      email,
      newPassword,
      confirmationCode,
    },
  });
  return res.data;
};
