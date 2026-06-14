// ─────────────────────────────────────────
//  AUTH API
// ─────────────────────────────────────────

import client from './client.js';

export const authApi = {
  /** Login with email & password */
  login: (credentials) =>
    client.post('/auth/login', credentials),

  /** Register new user */
  register: (data) =>
    client.post('/auth/register', data),

  /** Logout (invalidate token server-side) */
  logout: () =>
    client.post('/auth/logout'),

  /** Refresh access token */
  refresh: (refreshToken) =>
    client.post('/auth/refresh', { refreshToken }),

  /** Request password reset email */
  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  /** Reset password with token */
  resetPassword: (token, password) =>
    client.post('/auth/reset-password', { token, password }),

  /** Get current user profile */
  me: () =>
    client.get('/auth/me'),

  /** Update current user profile */
  updateProfile: (data) =>
    client.patch('/auth/me', data),

  /** Change password */
  changePassword: (data) =>
    client.post('/auth/change-password', data),
};

export default authApi;