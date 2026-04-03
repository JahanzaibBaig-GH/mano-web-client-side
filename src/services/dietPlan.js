import api from './api';

// GET /api/ai/diet-plans?medicalHistoryId=<id>
export const getDietPlanByMedicalHistoryId = (medicalHistoryId) =>
  api.get('/ai/diet-plans', { params: { medicalHistoryId } }).then((r) => r.data);

// POST /api/ai/diet-plans  — { medical_history_id?, duration_weeks?, force_replace?, replace_with_status? }
// The ML engine can take up to 2 minutes — override the global 10s timeout.
export const generateDietPlan = (data = {}) =>
  api.post('/ai/diet-plans', data, { timeout: 120_000 }).then((r) => r.data);

// GET /api/ai/diet-plans  — paginated list of the user's diet plans
export const listDietPlans = (params = {}) =>
  api.get('/ai/diet-plans', { params }).then((r) => r.data);

// GET /api/ai/diet-plans/active  — today's active diet plan + meal alarms
export const getActiveDietPlan = () =>
  api.get('/ai/diet-plans/active').then((r) => r.data);

// GET /api/ai/diet-plans/:planId  — single diet plan details
export const getDietPlan = (planId) =>
  api.get(`/ai/diet-plans/${planId}`).then((r) => r.data);

// PATCH /api/ai/diet-plans/:planId  — update status or adherence score
export const updateDietPlan = (planId, data) =>
  api.patch(`/ai/diet-plans/${planId}`, data).then((r) => r.data);
