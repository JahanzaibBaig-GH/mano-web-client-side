import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';
import { createAssessment, generatePrescription, getDiabetesDashboard } from '../../services/diabetes';

export default function Diabetes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [rxLoading, setRxLoading] = useState(false);
  const [symptomsText, setSymptomsText] = useState('');
  const symptoms = useMemo(
    () => symptomsText.split(',').map((s) => s.trim()).filter(Boolean),
    [symptomsText]
  );

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const d = await getDiabetesDashboard();
        setDashboard(d);
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load diabetes dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const handleRunAssessment = async () => {
    setAssessmentLoading(true);
    try {
      const res = await createAssessment({});
      setAssessment(res);
      showToast('Assessment generated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate assessment', 'error');
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleGeneratePrescription = async () => {
    if (symptoms.length === 0) {
      showToast('Please enter at least one symptom', 'error');
      return;
    }
    setRxLoading(true);
    try {
      await generatePrescription({ symptoms, region: 'pakistan', emergency: false });
      showToast('Prescription generated', 'success');
      // refresh dashboard to reflect new prescriptions/alarms
      const d = await getDiabetesDashboard();
      setDashboard(d);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate prescription', 'error');
    } finally {
      setRxLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head><title>Diabetes Management – Mano App</title></Head>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diabetes Management</h1>
            <p className="text-gray-500 text-sm mt-1">Your diabetes dashboard, compliance, and next reminders.</p>
          </div>
          <button
            onClick={handleRunAssessment}
            disabled={assessmentLoading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {assessmentLoading ? <><LoadingSpinner size="sm" /> Running…</> : 'Run assessment'}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex items-center justify-center gap-3 text-sm text-gray-500">
            <LoadingSpinner size="sm" /> Loading dashboard…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="bg-teal-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Compliance rate (30 days)</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {dashboard?.diabetes_overview?.compliance_rate ?? '—'}
                  <span className="text-sm font-normal text-gray-500">%</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Medication adherence</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Upcoming alarms (24h)</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {dashboard?.medication_status?.upcoming_alarms ?? '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Next reminders</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Next medication</p>
                {dashboard?.medication_status?.next_medication ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {dashboard.medication_status.next_medication.medication}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboard.medication_status.next_medication.dosage
                        ? `${dashboard.medication_status.next_medication.dosage} · `
                        : ''}
                      {String(dashboard.medication_status.next_medication.time || '')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No upcoming medication</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <h2 className="font-bold text-gray-900 mb-2">AI prescription generation</h2>
              <p className="text-gray-500 text-sm mb-4">Generate a diabetes prescription based on symptoms (requires diabetes in your medical history).</p>

              <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma-separated)</label>
              <input
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="e.g. frequent urination, increased thirst, fatigue"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <button
                onClick={handleGeneratePrescription}
                disabled={rxLoading}
                className="mt-3 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {rxLoading ? <><LoadingSpinner size="sm" /> Generating…</> : 'Generate prescription'}
              </button>
            </div>

            {assessment ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-2">Latest assessment</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="font-bold text-gray-900 capitalize">{assessment?.diabetes_analysis?.type ?? '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Severity</p>
                    <p className="font-bold text-gray-900 capitalize">{assessment?.diabetes_analysis?.severity?.prediction ?? '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Region</p>
                    <p className="font-bold text-gray-900 capitalize">{assessment?.regional_recommendations?.region ?? '—'}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

      </div>
    </ProtectedRoute>
  );
}
