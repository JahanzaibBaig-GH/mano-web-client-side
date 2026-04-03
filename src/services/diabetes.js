import api from './api';
import { API_PATHS } from '../constants';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export const getDiabetesDashboard = async () => {
  const res = await api.get(API_PATHS.DIABETES.DASHBOARD);
  return unwrap(res);
};

export const createAssessment = async (payload = {}) => {
  const res = await api.post(API_PATHS.DIABETES.ASSESSMENTS, payload, { timeout: 120_000 });
  return unwrap(res);
};

export const generatePrescription = async (payload) => {
  const res = await api.post(API_PATHS.DIABETES.PRESCRIPTIONS, payload, { timeout: 120_000 });
  return unwrap(res);
};

export const manageDiabetesAlarms = async (payload) => {
  const res = await api.post(API_PATHS.DIABETES.ALARMS, payload);
  return unwrap(res);
};

