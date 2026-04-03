import api from './api';
import { API_PATHS } from '../constants';

const { AUTH } = API_PATHS;

export const register = (userData) =>
  api.post(AUTH.REGISTER, userData);

export const login = (credentials) =>
  api.post(AUTH.LOGIN, credentials);

export const logout = () =>
  api.post(AUTH.LOGOUT);

export const getProfile = () =>
  api.get(AUTH.PROFILE);

export const verifyEmail = (email, otp) =>
  api.post(AUTH.VERIFY_EMAIL, { email, otp });

export const forgotPassword = (email) =>
  api.post(AUTH.FORGOT_PASSWORD, { email });

export const resetPassword = (token, password) =>
  api.post(AUTH.RESET_PASSWORD, { token, password });

export const refreshToken = (refreshToken) =>
  api.post(AUTH.REFRESH, { refresh_token: refreshToken });

export const resendVerification = (email) =>
  api.post(AUTH.RESEND_VERIFICATION, { email });
