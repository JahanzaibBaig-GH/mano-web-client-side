/**
 * API path segments (used with the base URL in services).
 * Base URL is configured in src/services/api.js (e.g. process.env.NEXT_PUBLIC_API_BASE_URL).
 */
export const API_PATHS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  MEDICAL_HISTORY: {
    ME: '/medical-history/me',
    BASE: '/medical-history',
    OCCUPATIONS: '/medical-history/occupations',
    MEDICATIONS: '/medical-history/medications',
    list: (userId) => `/medical-history/${userId}/history`,
    detail: (userId, historyId) => `/medical-history/${userId}/history/${historyId}`,
    recommendations: (userId) => `/medical-history/${userId}/recommendations`,
  },
  DIET_PLANS: {
    BASE: '/ai/diet-plans',
    ACTIVE: '/ai/diet-plans/active',
    byId: (planId) => `/ai/diet-plans/${planId}`,
  },
  DOCTORS: {
    LIST: '/doctors',
    SEARCH: '/doctors/search',
  },
  DIABETES: {
    DASHBOARD: '/diabetes/dashboard',
    ASSESSMENTS: '/diabetes/assessments',
    PRESCRIPTIONS: '/diabetes/prescriptions',
    ALARMS: '/diabetes/alarms',
  },
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    ME: '/prescriptions/me',
    ALARMS_ACTIVE: '/prescriptions/alarms/active',
    patient: (patientId) => `/prescriptions/patients/${patientId}`,
    byId: (id) => `/prescriptions/${id}`,
    update: (id) => `/prescriptions/${id}`,
    medicationLogs: (id) => `/prescriptions/${id}/medication-logs`,
  },
};
