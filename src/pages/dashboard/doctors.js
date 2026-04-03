import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listDoctors, searchDoctors } from '../../services/doctors';

const formatLabel = (str) =>
  str ? str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const SPECIALIZATIONS = [
  'All',
  'General Practitioner',
  'Cardiologist',
  'Endocrinologist',
  'Nutritionist',
  'Dermatologist',
  'Neurologist',
  'Orthopedist',
  'Psychiatrist',
  'Pediatrician',
];

function DoctorCard({ doctor }) {
  const profile = doctor.doctor_profile ?? doctor;
  const name = doctor.name ?? '—';
  const specialization = profile.specialization ?? '—';
  const hospital = profile.current_hospital_name ?? profile.current_position ?? null;
  const experience = profile.years_of_experience;
  const fee = profile.consultation_fee;
  const available = profile.consultation_available ?? doctor.consultation_available;
  const hours = profile.consultation_hours;

  // Extract today's hours if available
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = days[new Date().getDay()];
  const todayHours = hours?.[todayKey];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow space-y-4">
      {/* Doctor info */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate">Dr. {name}</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          {specialization !== '—' && (
            <p className="text-xs text-teal-600 font-medium mt-0.5">{specialization}</p>
          )}
          {hospital && <p className="text-xs text-gray-500 mt-0.5 truncate">{hospital}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {experience != null && (
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="font-bold text-gray-900 text-sm">{experience}+ yrs</p>
            <p className="text-xs text-gray-500">Experience</p>
          </div>
        )}
        {fee != null && (
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="font-bold text-gray-900 text-sm">PKR {fee}</p>
            <p className="text-xs text-gray-500">Consultation fee</p>
          </div>
        )}
      </div>

      {/* Today's hours */}
      {todayHours && (
        <div className="text-xs text-gray-600 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Today:{' '}
          {todayHours.start && todayHours.end
            ? `${todayHours.start} – ${todayHours.end}`
            : todayHours.available === false
            ? 'Not available today'
            : 'Hours not specified'}
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [searching, setSearching] = useState(false);

  const fetchDoctors = useCallback(async (spec) => {
    setLoading(true);
    setError(null);
    try {
      const params = spec && spec !== 'All' ? { specialization: spec } : {};
      const res = await listDoctors(params);
      const data = res?.data?.doctors ?? res?.doctors ?? [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors(selectedSpec);
  }, [fetchDoctors, selectedSpec]);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) {
        fetchDoctors(selectedSpec);
        return;
      }
      setSearching(true);
      setError(null);
      try {
        const res = await searchDoctors({
          q: searchQuery.trim(),
          ...(selectedSpec !== 'All' ? { specialization: selectedSpec } : {}),
        });
        const data = res?.data?.doctors ?? res?.doctors ?? [];
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Search failed. Please try again.');
      } finally {
        setSearching(false);
      }
    },
    [searchQuery, selectedSpec, fetchDoctors]
  );

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchDoctors(selectedSpec);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Find a Doctor – Mano App</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse approved doctors available for consultation.
          </p>
        </div>

        {/* How consultation works */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="font-bold text-blue-900 text-sm">How doctor consultation works</h2>
          </div>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>
                <strong>Create a medical history record.</strong> Go to{' '}
                <Link
                  href="/dashboard/medical-history/create"
                  className="underline font-semibold hover:text-blue-900"
                >
                  Medical History → Create
                </Link>{' '}
                and fill in your health information.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>
                <strong>Your record enters the review queue.</strong> Once submitted, doctors can
                see your medical history and add professional notes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>
                <strong>Doctor reviews & responds.</strong> A doctor will review your record and
                add clinical notes. You can check the status from your{' '}
                <Link
                  href="/dashboard/medical-history"
                  className="underline font-semibold hover:text-blue-900"
                >
                  Medical History
                </Link>{' '}
                page.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
              <span>
                <strong>Receive prescriptions.</strong> If the doctor prescribes medication, you
                can view it under{' '}
                <Link
                  href="/dashboard/prescriptions"
                  className="underline font-semibold hover:text-blue-900"
                >
                  Prescriptions
                </Link>
                .
              </span>
            </li>
          </ol>
        </div>

        {/* Search + filter */}
        <div className="space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              {searching ? <LoadingSpinner size="sm" /> : 'Search'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          {/* Specialization filter */}
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpec(spec)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  selectedSpec === spec
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-sm text-red-600">
            {error}
            <button
              onClick={() => fetchDoctors(selectedSpec)}
              className="block mx-auto mt-3 text-teal-600 font-medium hover:text-teal-700"
            >
              Try again
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <p className="font-bold text-gray-900">No doctors found</p>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? 'Try a different search term or remove the specialization filter.'
                : 'No doctors are currently available. Check back later.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">
              {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Ready to get reviewed?</p>
            <p className="text-gray-500 text-xs mt-0.5">
              Make sure your medical history is up to date before a doctor reviews it.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/medical-history"
              className="text-sm font-medium bg-white border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-700 px-4 py-2 rounded-xl transition-colors"
            >
              My Medical History
            </Link>
            <Link
              href="/dashboard/medical-history/create"
              className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Create / Update Record
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
