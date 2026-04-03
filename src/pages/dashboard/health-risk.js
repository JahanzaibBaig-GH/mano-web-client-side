import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';
import { getAIRecommendations, getMyMedicalHistory } from '../../services/medicalHistory';

export default function HealthRisk() {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getMyMedicalHistory();
        const payload = res?.data ?? res;
        const mh = payload?.medical_history ?? payload?.data?.medical_history ?? null;
        setMedicalHistory(mh);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to load medical history', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    setRecLoading(true);
    try {
      const res = await getAIRecommendations(user.id);
      const payload = res?.data ?? res;
      setRecommendations(payload);
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to load recommendations', 'error');
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head><title>Health Risk Assessment – Mano App</title></Head>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Health Risk Assessment</h1>
          <p className="text-gray-500 text-sm mt-1">Based on your medical history (BMI + risk level) and optional AI recommendations.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex items-center justify-center gap-3 text-sm text-gray-500">
            <LoadingSpinner size="sm" /> Loading medical history…
          </div>
        ) : notFound ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-600 text-sm">No medical history found.</p>
            <p className="text-gray-400 text-xs mt-1">Complete your medical history to see BMI and risk level.</p>
            <Link
              href="/dashboard/medical-history/create"
              className="inline-flex items-center gap-2 mt-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Create Medical History
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Your risk snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">BMI</p>
                  <p className="text-2xl font-extrabold text-gray-900">{medicalHistory?.bmi ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">BMI category</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{medicalHistory?.bmi_category ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Health risk level</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{medicalHistory?.health_risk_level ?? '—'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadRecommendations}
                  disabled={recLoading}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {recLoading ? <><LoadingSpinner size="sm" /> Loading…</> : 'Load AI recommendations'}
                </button>
                <Link href="/dashboard/medical-history" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View medical history
                </Link>
              </div>
            </div>

            {recommendations?.ai_recommendations ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">AI recommendations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['dietary', 'exercise', 'lifestyle'].map((k) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 capitalize">{k}</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                        {(recommendations.ai_recommendations?.[k] || []).slice(0, 6).map((item, idx) => (
                          <li key={`${k}-${idx}`}>{item}</li>
                        ))}
                        {(recommendations.ai_recommendations?.[k] || []).length === 0 ? (
                          <li className="text-gray-400">No items</li>
                        ) : null}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-xs text-gray-400">
              This assessment is for informational purposes only and does not replace professional medical advice.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
