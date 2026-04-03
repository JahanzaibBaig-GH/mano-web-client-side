import api from './api';
import { API_PATHS } from '../constants';

const { PRESCRIPTIONS } = API_PATHS;

const unwrap = (r) => r?.data?.data ?? r?.data;

export const getPatientPrescriptions = (patientId, params = {}) =>
  api.get(PRESCRIPTIONS.patient(patientId), { params }).then(unwrap);

export const getDoctorPrescriptions = (params = {}) =>
  api.get(PRESCRIPTIONS.ME, { params }).then(unwrap);

export const getActivePrescriptionAlarms = () =>
  api.get(PRESCRIPTIONS.ALARMS_ACTIVE).then(unwrap);

export const getPrescriptionById = (id) =>
  api.get(PRESCRIPTIONS.byId(id)).then(unwrap);

export const updatePrescription = (id, data) =>
  api.patch(PRESCRIPTIONS.update(id), data).then(unwrap);

export const recordMedicationTaken = (prescriptionId, medicationName, takenAt = null) =>
  api
    .post(PRESCRIPTIONS.medicationLogs(prescriptionId), {
      medication_name: medicationName,
      taken_at: takenAt || undefined,
    })
    .then(unwrap);
