import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import MedicalHistoryForm from '../../../components/MedicalHistoryForm';
import { showToast } from '../../../components/Toast';
import { createMedicalHistory } from '../../../services/medicalHistory';

export default function CreateMedicalHistory() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setIsLoading(true);
    try {
      await createMedicalHistory(payload);
      showToast('Medical history created successfully!', 'success');
      router.push('/dashboard/medical-history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create medical history. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Create Medical History – Mano App</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/dashboard/medical-history" className="hover:text-teal-600 transition-colors">
              Medical History
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-800 font-medium">Create New</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Medical History</h1>
              <p className="text-gray-500 text-sm mt-1">
                Fill in your health profile to get personalised recommendations and AI-driven insights.
              </p>
            </div>
          </div>
        </div>

        {/* ── Info Banner ── */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-teal-800">Complete all sections for best results</p>
            <p className="text-xs text-teal-700 mt-0.5">
              Your medical history is used to generate AI diet plans, health risk assessments, and personalised advice. Only required fields are marked — all others are optional but improve accuracy.
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <MedicalHistoryForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Medical History"
          onCancel={() => router.push('/dashboard/medical-history')}
        />
      </div>
    </ProtectedRoute>
  );
}
