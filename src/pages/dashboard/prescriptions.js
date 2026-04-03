import Head from 'next/head';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';
import {
  getActivePrescriptionAlarms,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  recordMedicationTaken,
} from '../../services/prescriptions';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(null); // `${prescriptionId}:${medicationName}`

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        if (user.role === 'doctor') {
          const rx = await getDoctorPrescriptions({ limit: 50 });
          setPrescriptions(rx?.prescriptions ?? rx?.data?.prescriptions ?? []);
        } else {
          const [rx, alarmRes] = await Promise.all([
            getPatientPrescriptions(user.id, { limit: 50 }),
            getActivePrescriptionAlarms(),
          ]);
          setPrescriptions(rx?.prescriptions ?? rx?.data?.prescriptions ?? []);
          setAlarms(alarmRes?.alarms ?? alarmRes?.data?.alarms ?? []);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load prescriptions', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id, user?.role]);

  const nextAlarm = alarms?.length
    ? [...alarms].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))[0]
    : null;

  const handleLogTaken = async (prescriptionId, medicationName) => {
    const key = `${prescriptionId}:${medicationName}`;
    setLogging(key);
    try {
      await recordMedicationTaken(prescriptionId, medicationName);
      showToast('Medication intake recorded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record intake', 'error');
    } finally {
      setLogging(null);
    }
  };

  return (
    <ProtectedRoute>
      <Head><title>Prescriptions & Alarms – Mano App</title></Head>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions & Alarms</h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.role === 'doctor'
                ? 'View prescriptions you have written.'
                : nextAlarm
                  ? `Next reminder: ${nextAlarm.title || 'Medication'} at ${nextAlarm.time}`
                  : 'Your prescription reminders will appear here.'}
            </p>
          </div>
          {user?.role === 'doctor' ? (
            <span className="text-xs text-gray-400">Create flow not yet wired</span>
          ) : null}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex items-center justify-center gap-3 text-sm text-gray-500">
            <LoadingSpinner size="sm" /> Loading prescriptions…
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">No prescriptions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">
                          {p.prescription_number ? `#${p.prescription_number}` : 'Prescription'}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 capitalize">
                          {p.status || 'active'}
                        </span>
                        {p.priority ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 capitalize">
                            {p.priority}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user?.role === 'doctor'
                          ? `Patient: ${p.patient?.name || p.patient?.email || '—'}`
                          : `Prescribed by ${p.doctor?.name || p.doctor?.email || '—'}`}
                      </p>
                      {p.diagnosis ? (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-semibold">Diagnosis:</span> {p.diagnosis}
                        </p>
                      ) : null}
                    </div>
                    {user?.role !== 'doctor' ? (
                      <div className="text-right">
                        {typeof p.total_alarms === 'number' ? (
                          <p className="text-xs text-gray-400">{p.total_alarms} reminders</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {Array.isArray(p.medications) && p.medications.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {p.medications.map((m, idx) => {
                        const key = `${p.id}:${m?.name || idx}`;
                        return (
                          <div key={key} className="border border-gray-100 rounded-xl p-3">
                            <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {m.dosage ? `${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
                            </p>
                            {Array.isArray(m.dosage_times) && m.dosage_times.length > 0 ? (
                              <p className="text-xs text-gray-400 mt-1">
                                Times: {m.dosage_times.join(', ')}
                              </p>
                            ) : null}
                            {m.instructions ? (
                              <p className="text-xs text-gray-500 mt-1">{m.instructions}</p>
                            ) : null}
                            {user?.role !== 'doctor' ? (
                              <button
                                onClick={() => handleLogTaken(p.id, m.name)}
                                disabled={logging === `${p.id}:${m.name}`}
                                className="mt-2 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {logging === `${p.id}:${m.name}` ? <><LoadingSpinner size="sm" /> Saving…</> : 'Mark taken'}
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">No medications listed.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
