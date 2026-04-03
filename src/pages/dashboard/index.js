import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Pill,
  Droplet,
  UtensilsCrossed,
  BarChart3,
  FileText,
  FilePlus,
  AlarmClock,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';
import { getActiveDietPlan } from '../../services/dietPlan';
import { getDiabetesDashboard } from '../../services/diabetes';
import { getMyMedicalHistory } from '../../services/medicalHistory';
import { getActivePrescriptionAlarms } from '../../services/prescriptions';

const scoreFromRisk = (risk) => {
  if (!risk) return null;
  const r = String(risk).toLowerCase();
  if (r === 'low') return 85;
  if (r === 'medium' || r === 'moderate') return 70;
  if (r === 'high') return 55;
  return 50;
};

const colorMap = {
  teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', text: 'text-teal-600' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
};

const quickActions = [
  { href: '/dashboard/medical-history', label: 'Add Record', icon: FilePlus },
  { href: '/dashboard/diabetes', label: 'Log Glucose', icon: Droplet },
  { href: '/dashboard/prescriptions', label: 'Set Alarm', icon: AlarmClock },
  { href: '/dashboard/diet-plans', label: 'View Diet', icon: UtensilsCrossed },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const [loading, setLoading] = useState(true);
  const [diet, setDiet] = useState(null);
  const [diabetes, setDiabetes] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [rxAlarms, setRxAlarms] = useState([]);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [dietRes, diaRes, mhRes, alarmsRes] = await Promise.all([
          getActiveDietPlan().catch(() => null),
          getDiabetesDashboard().catch(() => null),
          getMyMedicalHistory().catch(() => null),
          getActivePrescriptionAlarms().catch(() => null),
        ]);

        const mhPayload = mhRes?.data ?? mhRes;
        setMedicalHistory(mhPayload?.medical_history ?? mhPayload?.data?.medical_history ?? null);

        setDiet(dietRes);
        setDiabetes(diaRes);

        const alarms = alarmsRes?.alarms ?? alarmsRes?.data?.alarms ?? [];
        setRxAlarms(Array.isArray(alarms) ? alarms : []);
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const sortedRxAlarms = useMemo(
    () => [...(rxAlarms || [])].sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))),
    [rxAlarms]
  );
  const topAlarms = sortedRxAlarms.slice(0, 3);
  const nextAlarm = sortedRxAlarms[0] || null;

  const healthScore = scoreFromRisk(medicalHistory?.health_risk_level);

  const quickStats = useMemo(() => ([
    {
      label: 'Health Score',
      value: healthScore ?? '—',
      unit: healthScore ? '/100' : '',
      change: medicalHistory?.health_risk_level ? `${String(medicalHistory.health_risk_level).replace(/_/g, ' ')} risk` : 'Complete medical history',
      positive: healthScore ? healthScore >= 70 : null,
      color: 'teal',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: 'Medications',
      value: rxAlarms?.length ?? 0,
      unit: 'alarms',
      change: nextAlarm?.time ? `Next: ${nextAlarm.time}` : 'No upcoming alarms',
      positive: null,
      color: 'blue',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: 'Diabetes Compliance',
      value: diabetes?.diabetes_overview?.compliance_rate ?? '—',
      unit: diabetes?.diabetes_overview?.compliance_rate != null ? '%' : '',
      change: diabetes?.medication_status?.upcoming_alarms != null
        ? `${diabetes.medication_status.upcoming_alarms} upcoming alarms`
        : 'Open diabetes dashboard',
      positive: diabetes?.diabetes_overview?.compliance_rate != null ? diabetes.diabetes_overview.compliance_rate >= 80 : null,
      color: 'green',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Diet Plan',
      value: diet?.data?.diet_plan || diet?.diet_plan ? 'Active' : '—',
      unit: '',
      change: diet ? 'View meals & alarms' : 'No active plan',
      positive: null,
      color: 'purple',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]), [diet, diabetes, healthScore, medicalHistory?.health_risk_level, nextAlarm?.time, rxAlarms?.length]);

  const recentActivity = useMemo(() => {
    const items = [];
    if (medicalHistory?.updated_at || medicalHistory?.updatedAt) {
      items.push({ id: 'mh', text: 'Medical history updated', time: 'Recently', icon: FileText });
    }
    if (diet) items.push({ id: 'diet', text: 'Diet plan available', time: 'Today', icon: UtensilsCrossed });
    if (rxAlarms?.length) items.push({ id: 'rx', text: 'Medication alarms active', time: 'Today', icon: Pill });
    if (diabetes) items.push({ id: 'dia', text: 'Diabetes dashboard updated', time: 'Today', icon: Droplet });
    if (!items.length) items.push({ id: 'empty', text: 'Complete your profile to see activity', time: '—', icon: BarChart3 });
    return items.slice(0, 5);
  }, [diet, diabetes, medicalHistory, rxAlarms?.length]);

  return (
    <ProtectedRoute>
      <Head><title>Dashboard – Mano App</title></Head>

      <div className="max-w-6xl mx-auto">
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here&apos;s your health summary for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat) => {
            const colors = colorMap[stat.color];
            return (
              <div key={stat.label} className={`${colors.bg} rounded-2xl p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 ${colors.icon} rounded-xl flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {stat.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.positive === true ? 'text-teal-600' : stat.positive === false ? 'text-red-500' : 'text-gray-400'}`}>
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            {loading ? (
              <div className="py-10 flex items-center justify-center gap-3 text-sm text-gray-500">
                <LoadingSpinner size="sm" /> Loading…
              </div>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.text}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Upcoming Medication Alarms */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Today&apos;s Medications</h2>
              <Link href="/dashboard/prescriptions" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="py-10 flex items-center justify-center gap-3 text-sm text-gray-500">
                <LoadingSpinner size="sm" /> Loading…
              </div>
            ) : topAlarms.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No active medication alarms.
              </div>
            ) : (
              <ul className="space-y-3">
                {topAlarms.map((alarm, idx) => (
                  <li key={`${alarm.prescription_id || 'rx'}-${idx}`} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{alarm.title || alarm.medication_name || 'Medication'}</p>
                      <p className="text-xs text-gray-500">{alarm.message || 'Reminder'} · {alarm.time || '—'}</p>
                    </div>
                    <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0" title="Upcoming" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 rounded-xl border border-gray-100 transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
