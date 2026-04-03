import api from './api';

// Fetch the authenticated user's active medical history
export const getMyMedicalHistory = () =>
  api.get('/medical-history/me').then((r) => r.data);

// Fetch paginated list of medical histories for a user
export const getMedicalHistoryList = (userId, params = {}) =>
  api.get(`/medical-history/${userId}/history`, { params: { page: 1, limit: 20, ...params } }).then((r) => r.data);

// Alias for backward compatibility
export const getMedicalHistoryVersions = (userId, limitOrParams = 10) => {
  const params = typeof limitOrParams === 'object' ? limitOrParams : { limit: limitOrParams };
  return getMedicalHistoryList(userId, params);
};

// Fetch full detail of one medical history (for preview)
export const getMedicalHistoryDetail = (userId, historyId) =>
  api.get(`/medical-history/${userId}/history/${historyId}`).then((r) => r.data);

// Create a new medical history record
export const createMedicalHistory = (data) =>
  api.post('/medical-history', data).then((r) => r.data);

// PATCH /api/medical-history/me — partially update the active medical history
export const updateMedicalHistory = (data) =>
  api.patch('/medical-history/me', data).then((r) => r.data);

// Fetch all available occupations from the database (dynamic)
export const getOccupations = () =>
  api.get('/medical-history/occupations').then((r) => r.data);

// GET /api/medical-history/:userId/recommendations — AI-generated health recommendations
export const getAIRecommendations = (userId) =>
  api.get(`/medical-history/${userId}/recommendations`).then((r) => r.data);

// Fetch medication names for dropdown (GET /api/medical-history/medications).
// Returns { data: { medications: [] }, medications: [] }; empty array when none configured.
export const getMedicationNames = () =>
  api.get('/medical-history/medications').then((r) => {
    const medications = r.data?.data?.medications ?? [];
    return { data: { medications }, medications };
  }).catch(() => ({ data: { medications: [] }, medications: [] }));
