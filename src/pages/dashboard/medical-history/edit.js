import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import MedicalHistoryForm from '../../../components/MedicalHistoryForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { showToast } from '../../../components/Toast';
import {
  getMyMedicalHistory,
  updateMedicalHistory,
} from '../../../services/medicalHistory';

// Normalise the API record into form-compatible shape
function normaliseRecord(record) {
  if (!record) return null;
  return {
    goal: record.goal || '',
    age: record.age?.toString() || '',
    gender: record.gender || '',
    height: record.height?.toString() || '',
    weight: record.weight?.toString() || '',
    medical_issues: record.medical_issues || [],
    medications: (record.medications || []).map((m) => ({
      name: m.name || '',
      dosage: m.dosage || '',
      frequency: m.frequency || '',
      duration: m.duration || '',
      start_date: m.start_date ? m.start_date.substring(0, 10) : '',
      notes: m.notes || '',
    })),
    allergies: record.allergies || '',
    lifestyle: record.lifestyle || '',
    dietary_preferences: record.dietary_preferences || '',
    occupation_id: record.occupation_id || '',
    emergency_contact_name: record.emergency_contact_name || '',
    emergency_contact_phone: record.emergency_contact_phone || '',
    emergency_contact_relationship: record.emergency_contact_relationship || '',
    is_pregnant: record.is_pregnant || false,
    pregnancy_month: record.pregnancy_month?.toString() || '',
    menstrual_cycle_issues: record.menstrual_cycle_issues || '',
    other_women_health_issues: record.other_women_health_issues || '',
  };
}

export default function EditMedicalHistory() {
  const router = useRouter();
  const [initialData, setInitialData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const res = await getMyMedicalHistory();
        const record = res?.data?.medical_history || res?.data || null;
        if (!record) {
          showToast('No existing medical history found. Please create one first.', 'error');
          router.replace('/dashboard/medical-history/create');
          return;
        }
        setInitialData(normaliseRecord(record));
      } catch (err) {
        if (err.response?.status === 404) {
          showToast('No existing medical history found. Please create one first.', 'error');
          router.replace('/dashboard/medical-history/create');
        } else {
          const msg = err.response?.data?.message || 'Failed to load your medical history.';
          setFetchError(msg);
          showToast(msg, 'error');
        }
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (payload) => {
    setIsLoading(true);
    try {
      await updateMedicalHistory(payload);
      showToast('Medical history updated successfully!', 'success');
      router.push('/dashboard/medical-history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update medical history. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Edit Medical History – Mano App</title>
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
            <span className="text-gray-800 font-medium">Edit</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Medical History</h1>
              <p className="text-gray-500 text-sm mt-1">
                Update your health information. Changes are saved as a new version.
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {fetchLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* ── Fetch Error ── */}
        {!fetchLoading && fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 text-sm font-medium">{fetchError}</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-500 hover:text-red-600 underline"
              >
                Try again
              </button>
              <Link
                href="/dashboard/medical-history"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Go back
              </Link>
            </div>
          </div>
        )}

        {/* ── Version Warning ── */}
        {!fetchLoading && !fetchError && initialData && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Submitting saves a new version</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your current record will be archived and a new one created with your updated information. Previous versions remain accessible in the history.
              </p>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {!fetchLoading && !fetchError && initialData && (
          <MedicalHistoryForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Update Medical History"
            onCancel={() => router.push('/dashboard/medical-history')}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
