import api from './api';

// GET /api/doctors — approved + available doctors (paginated, filter by specialization)
// params: { page, limit, specialization, available }
export const listDoctors = (params = {}) =>
  api.get('/doctors', { params }).then((r) => r.data);

// GET /api/doctors/search — search doctors by name, specialization, availability
// params: { q, specialization, available }
export const searchDoctors = (params = {}) =>
  api.get('/doctors/search', { params }).then((r) => r.data);
