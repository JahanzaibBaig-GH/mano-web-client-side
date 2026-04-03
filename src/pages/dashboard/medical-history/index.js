import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { showToast } from '../../../components/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { getMedicalHistoryList } from '../../../services/medicalHistory';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatLabel = (str) =>
  str ? str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const riskColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  moderate: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const goalColors = {
  weight_loss: 'bg-blue-100 text-blue-700',
  weight_gain: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-teal-100 text-teal-700',
  muscle_gain: 'bg-orange-100 text-orange-700',
  general_wellness: 'bg-teal-100 text-teal-700',
  improve_energy: 'bg-amber-100 text-amber-700',
  better_sleep: 'bg-indigo-100 text-indigo-700',
  disease_management: 'bg-red-100 text-red-700',
};

const bmiLabel = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
  return { label: 'Obese', color: 'text-red-600' };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatBadge({ label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-gray-900 text-sm">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── List Row with link to detail page ─────────────────────────────────────────

function HistoryListRow({ record, index, page, limit }) {
  const bmi = record.bmi || (
    record.height && record.weight
      ? (Number(record.weight) / Math.pow(Number(record.height) / 100, 2)).toFixed(1)
      : null
  );
  const created = record.createdAt || record.created_at;

  return (
    <Link
      href={`/dashboard/medical-history/${record.id}`}
      className="border border-gray-100 rounded-xl overflow-hidden flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
          {(page - 1) * limit + index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {formatDate(created)} · {formatLabel(record.goal)}
          </p>
          <p className="text-xs text-gray-500">
            {record.age} yrs · {record.weight} kg · {record.height} cm
            {bmi && ` · BMI ${bmi}`}
          </p>
        </div>
        {record.health_risk_level && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${riskColors[record.health_risk_level] || 'bg-gray-100 text-gray-600'}`}>
            {formatLabel(record.health_risk_level)}
          </span>
        )}
      </div>
      <span className="shrink-0 flex items-center gap-1.5 text-teal-600 font-medium text-sm">
        View details
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MedicalHistoryList() {
  const router = useRouter();
  const { user } = useAuth();

  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadList = async (page = 1, limit = 20) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMedicalHistoryList(user.id, { page, limit });
      const data = res?.data ?? res;
      const items = Array.isArray(data.medical_histories) ? data.medical_histories : [];
      const pag = data.pagination || {};
      setList(items);
      setPagination({
        page: pag.page ?? page,
        limit: pag.limit ?? limit,
        total: pag.total ?? items.length,
        totalPages: Math.max(1, pag.totalPages ?? Math.ceil((pag.total ?? items.length) / (pag.limit ?? limit)))
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical history list.');
      showToast('Failed to load list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList(1, 20);
  }, [user?.id]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadList(newPage, pagination.limit);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Medical History – Mano App</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-500 text-sm mt-1">
              All your health profiles and records. Add a new record for a different goal (e.g. weight loss, improve energy).
            </p>
          </div>
          <Link
            href="/dashboard/medical-history/create"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Record
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button onClick={() => loadList(1, 20)} className="mt-3 text-sm text-red-500 hover:text-red-600 underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Medical History Yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Create your health profile to get personalised diet plans, AI recommendations, and risk assessments.
            </p>
            <Link
              href="/dashboard/medical-history/create"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Medical History
            </Link>
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">All records</h3>
                <span className="text-xs text-gray-500">
                  {pagination.total} total · page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {list.map((record, index) => (
                  <HistoryListRow
                    key={record.id}
                    record={record}
                    index={index}
                    page={pagination.page}
                    limit={pagination.limit}
                  />
                ))}
              </div>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/dashboard/medical-history/edit" className="text-teal-600 hover:text-teal-700 font-medium">
                Edit active record
              </Link>
              <span>·</span>
              <Link href="/dashboard/medical-history/create" className="text-teal-600 hover:text-teal-700 font-medium">
                Create new record
              </Link>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
