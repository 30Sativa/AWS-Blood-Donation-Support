import api from "./api";

export const getUserProfile = async () => {
  const res = await api.get("/Users/me");
  return res.data;
};

// Confirm email
export const confirmEmail = async (email, verificationCode) => {
  // Backend expects Email and ConfirmationCode (case-sensitive property names)
  const res = await api.post("/Users/confirm-email", {
    Email: email,
    ConfirmationCode: verificationCode,
  });
  console.log("Confirm email API request:", {
    Email: email,
    ConfirmationCode: verificationCode,
  });
  console.log("Confirm email API response:", res);
  console.log("Confirm email response data:", res.data);
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

// Resend confirmation code (for email confirmation or forgot password)
export const resendConfirmationCode = async (email) => {
  const res = await api.post("/Users/resend-confirmation-code", {
    email,
  });
  return res.data;
};