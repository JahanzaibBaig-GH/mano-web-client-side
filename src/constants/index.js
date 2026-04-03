/**
 * Centralized constants for the application.
 * Import from here to follow DRY and keep all reusable values in one place.
 *
 * Usage:
 *   import { ROUTES, STORAGE_KEYS, API_PATHS, MESSAGES } from '@/constants';
 *   import { GOALS, GENDERS } from '@/constants';  // or from '../constants'
 */

export { ROUTES } from './routes';
export { STORAGE_KEYS } from './storage';
export { API_PATHS } from './apiPaths';
export { MESSAGES } from './messages';

// Medical history form options (static dropdown data)
export {
  GOALS,
  GENDERS,
  MEDICAL_ISSUES,
  LIFESTYLES,
  RELATIONSHIPS,
  MEDICATION_DOSAGES,
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
  PREGNANCY_MONTHS,
} from './medicalHistory';
