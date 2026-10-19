import api from './api';

// POST /auth/login -> { success, message, data: user, token }
export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// POST /auth/register -> { success, message, data: user } (no token; the account can
// sign in straight away, verifying the email is optional)
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// POST /auth/verify-email -> body { email, otp }
export const verifyEmail = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-email', { email, otp });
  return response.data;
};

// POST /auth/resend-verification -> body { email }
export const resendVerification = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

// POST /auth/forgot-password -> body { email } (always answers 202)
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// POST /auth/reset-password -> body { email, otp, newPassword }
export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

// PATCH /auth/change-password -> body { oldPassword, newPassword }
// A successful change invalidates existing access tokens.
export const changePassword = async ({ oldPassword, newPassword }) => {
  const response = await api.patch('/auth/change-password', { oldPassword, newPassword });
  return response.data;
};

// POST /auth/logout -> requires the bearer token, increments tokenVersion
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
