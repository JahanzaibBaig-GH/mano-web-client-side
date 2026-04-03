import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  UtensilsCrossed,
  Dumbbell,
  Moon,
  ClipboardList,
  ShieldAlert,
  CalendarDays,
  AlertCircle,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Info,
  X,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import { getMedicalHistoryDetail, getAIRecommendations } from '../../../services/medicalHistory';
import { getDietPlanByMedicalHistoryId, generateDietPlan } from '../../../services/dietPlan';

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

const bmiLabel = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
  return { label: 'Obese', color: 'text-red-600' };
};

const RISK_BADGE = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

function StatBadge({ label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-gray-900 text-sm">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// AI Recommendations Panel — renders the full structured response
// ──────────────────────────────────────────────────────────────
const REC_CATEGORIES = [
  {
    key: 'dietary',
    label: 'Dietary Recommendations',
    Icon: UtensilsCrossed,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    border: 'border-green-200',
    bg: 'bg-green-50/50',
  },
  {
    key: 'exercise',
    label: 'Exercise Recommendations',
    Icon: Dumbbell,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50/50',
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle Recommendations',
    Icon: Moon,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50/50',
  },
];

const FOLLOW_UP_CONFIG = {
  high: {
    Icon: AlertCircle,
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  medium: {
    Icon: Clock,
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  low: {
    Icon: Info,
    iconColor: 'text-gray-400',
    badge: 'bg-gray-100 text-gray-600',
  },
};

function AIRecommendationsPanel({ data }) {
  if (!data) return null;

  const { ai_recommendations, risk_assessment, action_plan, ai_metadata, medical_history_summary } =
    data;

  const riskLevel = risk_assessment?.level ?? medical_history_summary?.health_risk_level;
  const confidence = ai_metadata?.original_confidence ?? ai_metadata?.adjusted_confidence;
  const followUps = ai_metadata?.follow_up_actions ?? [];

  return (
    <div className="space-y-5">
      {/* Meta row — risk badge · confidence · generated date */}
      <div className="flex flex-wrap items-center gap-3">
        {riskLevel && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              RISK_BADGE[riskLevel] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {formatLabel(riskLevel)} risk
          </span>
        )}
        {confidence != null && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            AI confidence:{' '}
            <span className="font-semibold text-gray-800 ml-0.5">
              {Math.round(confidence * 100)}%
            </span>
          </span>
        )}
        {ai_metadata?.generated_at && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            <CalendarDays className="w-3.5 h-3.5" />
            Generated {formatDate(ai_metadata.generated_at)}
          </span>
        )}
      </div>

      {/* Recommendation categories */}
      {REC_CATEGORIES.map(({ key, label, Icon, iconBg, iconColor, border, bg }) => {
        const items = ai_recommendations?.[key];
        if (!items?.length) return null;
        return (
          <div key={key} className={`rounded-2xl border ${border} ${bg} p-4`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </span>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
            </div>
            <ul className="space-y-2.5 pl-1">
              {items.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Action plan */}
      {action_plan?.length > 0 && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 text-teal-600" />
            </span>
            <p className="text-sm font-semibold text-gray-800">Action Plan</p>
          </div>
          <ol className="space-y-2.5 pl-1">
            {action_plan.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Follow-up actions */}
      {followUps.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Recommended Follow-up Actions</p>
          <div className="grid gap-2">
            {followUps.map((fu, i) => {
              const cfg = FOLLOW_UP_CONFIG[fu.priority] ?? FOLLOW_UP_CONFIG.low;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-3.5"
                >
                  <cfg.Icon className={`w-4.5 h-4.5 ${cfg.iconColor} shrink-0 mt-0.5`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                      >
                        {formatLabel(fu.priority ?? 'normal')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{fu.description}</p>
                    {fu.timeline && (
                      <p className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                        <Clock className="w-3 h-3" />
                        Timeline: {fu.timeline}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Replace-status options (shared between pages)
// ──────────────────────────────────────────────────────────────
const REPLACE_OPTIONS = [
  {
    status: 'completed',
    label: 'Mark as Completed',
    Icon: CheckCircle2,
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    desc: 'I finished following this plan',
  },
  {
    status: 'paused',
    label: 'Pause It',
    Icon: PauseCircle,
    color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
    desc: 'I want to come back to it later',
  },
  {
    status: 'cancelled',
    label: 'Cancel It',
    Icon: XCircle,
    color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    desc: "I won't be continuing this plan",
  },
];

// ──────────────────────────────────────────────────────────────
// Generate Diet Plan inline form (with built-in conflict card)
// ──────────────────────────────────────────────────────────────
function GenerateDietPlanForm({
  onGenerate,
  generating,
  generateError,
  onCancel,
  // Conflict props — set when backend returns 409
  conflictPlan,
  onConflictResolve,
  resolving,
  onDismissConflict,
}) {
  const [weeks, setWeeks] = useState(4);

  // ── Conflict resolution view ──────────────────────────────
  if (conflictPlan) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Active plan already exists</p>
            <p className="text-xs text-gray-600 mt-0.5">
              This medical history already has an active diet plan. You must update its status
              before generating a new one.
            </p>
          </div>
          {onDismissConflict && (
            <button
              type="button"
              onClick={onDismissConflict}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Existing plan mini-summary */}
        {conflictPlan.plan_type && (
          <div className="bg-white border border-amber-200 rounded-xl p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-800">{formatLabel(conflictPlan.plan_type)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              Started {formatDate(conflictPlan.start_date)}
              {conflictPlan.duration_weeks ? ` · ${conflictPlan.duration_weeks} weeks` : ''}
            </p>
            {conflictPlan.daily_calories && (
              <p className="text-xs text-gray-500">{conflictPlan.daily_calories} kcal / day</p>
            )}
          </div>
        )}

        <p className="text-xs font-semibold text-gray-700">
          What would you like to do with the existing plan?
        </p>

        <div className="grid gap-2">
          {REPLACE_OPTIONS.map(({ status, label, Icon, color, desc }) => (
            <button
              key={status}
              type="button"
              onClick={() => onConflictResolve(status)}
              disabled={resolving}
              className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
            >
              {resolving ? <LoadingSpinner size="sm" /> : <Icon className="w-4 h-4 shrink-0" />}
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs opacity-75">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {generateError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            {generateError}
          </div>
        )}
      </div>
    );
  }

  // ── Normal form view ──────────────────────────────────────
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Configure your diet plan</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700">Duration</label>
          <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg">
            {weeks} {weeks === 1 ? 'week' : 'weeks'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={52}
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-full appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 week</span>
          <span>52 weeks</span>
        </div>
      </div>

      {generateError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
          {generateError}
        </div>
      )}

      <button
        type="button"
        onClick={() => onGenerate(weeks)}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
      >
        {generating ? (
          <>
            <LoadingSpinner size="sm" />
            Generating… (may take up to 30 s)
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate {weeks}-week AI Diet Plan
          </>
        )}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Diet Plan sub-component
// ──────────────────────────────────────────────────────────────
const TAB_MEDICAL = 'medical-history';
const TAB_DIET = 'diet-plan';

function DietPlanDetail({
  dietPlan, loading, error,
  generating, generateError, onGenerate,
  conflictPlan, onConflictResolve, resolving, onDismissConflict,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
        <p className="text-amber-700 font-medium">{error}</p>
      </div>
    );
  }
  if (!dietPlan) {
    return (
      <div className="space-y-4">
        <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900">No Diet Plan Yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Configure and generate a personalized AI diet plan tailored to this medical history.
            </p>
          </div>
        </div>
        <GenerateDietPlanForm
          onGenerate={onGenerate}
          generating={generating}
          generateError={generateError}
          conflictPlan={conflictPlan}
          onConflictResolve={onConflictResolve}
          resolving={resolving}
          onDismissConflict={onDismissConflict}
        />
      </div>
    );
  }

  const meals = dietPlan.meals || dietPlan.todays_meals || {};
  const mealKeys = Object.keys(meals);

  return (
    <div className="space-y-6">
      <Section title="Plan overview" className="border-amber-100 bg-amber-50/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBadge label="Plan type" value={formatLabel((dietPlan.plan_type || '').replace(/_/g, ' '))} />
          <StatBadge label="Daily calories" value={`${dietPlan.daily_calories ?? '—'} kcal`} />
          <StatBadge label="Duration" value={`${dietPlan.duration_weeks ?? '—'} weeks`} />
          <StatBadge label="Water goal" value={`${dietPlan.daily_water_goal ?? '—'} ml`} />
          {dietPlan.days_remaining != null && (
            <StatBadge label="Days remaining" value={String(dietPlan.days_remaining)} />
          )}
          {dietPlan.ai_confidence != null && (
            <StatBadge label="AI confidence" value={`${Math.round(Number(dietPlan.ai_confidence) * 100)}%`} />
          )}
          <StatBadge label="Status" value={formatLabel(dietPlan.status || '')} />
          <StatBadge label="Generated by" value={formatLabel(dietPlan.generated_by || '')} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {dietPlan.start_date && <span>Start: {formatDate(dietPlan.start_date)}</span>}
          {dietPlan.end_date && <span>End: {formatDate(dietPlan.end_date)}</span>}
          {dietPlan.is_expired && <span className="font-medium text-amber-700">Plan expired</span>}
        </div>
        {dietPlan.progress_percentage != null && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Progress</p>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, dietPlan.progress_percentage))}%` }}
              />
            </div>
          </div>
        )}
      </Section>

      {mealKeys.length > 0 && (
        <Section title="Daily meals">
          <div className="space-y-6">
            {mealKeys.map((mealType) => {
              const meal = meals[mealType];
              if (!meal) return null;
              const items = Array.isArray(meal.items) ? meal.items : [];
              const time = meal.time || (meal.times && meal.times[0]) || '—';
              const times = meal.times || (meal.time ? [meal.time] : []);
              const calories = meal.calories != null ? meal.calories : '—';
              return (
                <div key={mealType} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{formatLabel(mealType)}</h4>
                    <span className="text-sm text-gray-500">
                      {Array.isArray(times) && times.length > 1 ? times.join(', ') : time}
                      {calories !== '—' && ` · ${calories} kcal`}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {items.map((item, i) => (
                      <li key={i}>
                        {typeof item === 'string' ? item : item?.name || JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {dietPlan.exercise_plan &&
        (dietPlan.exercise_plan.types?.length > 0 || dietPlan.exercise_plan.frequency) && (
          <Section title="Exercise plan">
            <div className="flex flex-wrap gap-4 text-sm">
              {dietPlan.exercise_plan.frequency && (
                <span className="font-medium text-gray-700">
                  Frequency: {dietPlan.exercise_plan.frequency}
                </span>
              )}
              {dietPlan.exercise_plan.duration && (
                <span className="text-gray-600">Duration: {dietPlan.exercise_plan.duration}</span>
              )}
            </div>
            {dietPlan.exercise_plan.types?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {dietPlan.exercise_plan.types.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Section>
        )}

      {dietPlan.dietary_restrictions?.length > 0 && (
        <Section title="Dietary restrictions & guidelines">
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {dietPlan.dietary_restrictions.map((r, i) => (
              <li key={i}>
                {typeof r === 'string' ? r : r?.name || r?.description || JSON.stringify(r)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {dietPlan.health_tips?.length > 0 && (
        <Section title="Health tips">
          <ul className="space-y-2">
            {dietPlan.health_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{typeof tip === 'string' ? tip : tip?.text || JSON.stringify(tip)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(dietPlan.active_alarms?.length > 0 || dietPlan.alarms?.length > 0) && (
        <Section title="Reminders & alarms">
          <div className="space-y-3">
            {(dietPlan.active_alarms || dietPlan.alarms || []).map((alarm, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900">{alarm.title}</span>
                  <span className="text-xs text-gray-500">{alarm.alarm_time}</span>
                  {alarm.alarm_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      {formatLabel(alarm.alarm_type)}
                    </span>
                  )}
                  {alarm.priority && (
                    <span className="text-xs text-gray-500">Priority: {alarm.priority}</span>
                  )}
                </div>
                {alarm.message && <p className="text-sm text-gray-600 mt-1">{alarm.message}</p>}
                {alarm.recurrence_pattern && (
                  <p className="text-xs text-gray-500 mt-1">
                    {alarm.recurrence_pattern}
                    {alarm.recurrence_days?.length
                      ? ` (days: ${alarm.recurrence_days.join(', ')})`
                      : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {dietPlan.notification_preferences && typeof dietPlan.notification_preferences === 'object' && (
        <Section title="Notification preferences">
          <div className="flex flex-wrap gap-4 text-sm">
            {dietPlan.notification_preferences.email != null && (
              <span className={dietPlan.notification_preferences.email ? 'text-gray-800' : 'text-gray-400'}>
                Email: {dietPlan.notification_preferences.email ? 'On' : 'Off'}
              </span>
            )}
            {dietPlan.notification_preferences.push != null && (
              <span className={dietPlan.notification_preferences.push ? 'text-gray-800' : 'text-gray-400'}>
                Push: {dietPlan.notification_preferences.push ? 'On' : 'Off'}
              </span>
            )}
            {dietPlan.notification_preferences.sms != null && (
              <span className={dietPlan.notification_preferences.sms ? 'text-gray-800' : 'text-gray-400'}>
                SMS: {dietPlan.notification_preferences.sms ? 'On' : 'Off'}
              </span>
            )}
          </div>
        </Section>
      )}

      {(dietPlan.doctor_approved != null || dietPlan.doctor_notes) && (
        <Section title="Doctor review" className="border-blue-100 bg-blue-50/30">
          {dietPlan.doctor_approved != null && (
            <p className="text-sm font-medium text-gray-800">
              Approved:{' '}
              <span className={dietPlan.doctor_approved ? 'text-green-600' : 'text-red-600'}>
                {dietPlan.doctor_approved ? 'Yes' : 'No'}
              </span>
            </p>
          )}
          {dietPlan.reviewed_at && (
            <p className="text-xs text-gray-500 mt-1">Reviewed: {formatDate(dietPlan.reviewed_at)}</p>
          )}
          {dietPlan.doctor_notes && (
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{dietPlan.doctor_notes}</p>
          )}
        </Section>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────
export default function MedicalHistoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dietPlan, setDietPlan] = useState(null);
  const [dietPlanLoading, setDietPlanLoading] = useState(false);
  const [dietPlanError, setDietPlanError] = useState(null);

  // Diet plan generation
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  // Conflict resolution — set when backend returns 409
  const [conflictPlan, setConflictPlan] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [pendingWeeks, setPendingWeeks] = useState(4);

  // AI health recommendations (stores the full raw response object)
  const [aiRecsData, setAiRecsData] = useState(null);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsError, setAiRecsError] = useState(null);

  const [activeTab, setActiveTab] = useState(TAB_MEDICAL);

  useEffect(() => {
    if (!id || !user?.id) return;
    setLoading(true);
    setError(null);
    getMedicalHistoryDetail(user.id, id)
      .then((res) => {
        const data = res?.data?.medical_history ?? res?.medical_history ?? res?.data ?? res;
        setDetail(data);
      })
      .catch(() => setError('Failed to load medical history.'))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  useEffect(() => {
    if (!id || loading || error || !detail) return;
    setDietPlanLoading(true);
    setDietPlanError(null);
    getDietPlanByMedicalHistoryId(id)
      .then((res) => {
        const plans = res?.data?.diet_plans ?? res?.diet_plans ?? [];
        const single = res?.data?.diet_plan ?? res?.diet_plan;
        const plan = single ?? (Array.isArray(plans) && plans.length > 0 ? plans[0] : null);
        setDietPlan(plan);
      })
      .catch((err) => {
        setDietPlan(null);
        setDietPlanError(err.response?.status === 404 ? null : 'Failed to load diet plan.');
      })
      .finally(() => setDietPlanLoading(false));
  }, [id, loading, error, detail]);

  // First attempt — if backend returns 409, show the conflict card instead of erroring
  const handleGenerateDietPlan = useCallback(
    async (durationWeeks) => {
      setGenerating(true);
      setGenerateError(null);
      setConflictPlan(null);
      setPendingWeeks(durationWeeks);
      setActiveTab(TAB_DIET);
      try {
        const res = await generateDietPlan({
          medical_history_id: id,
          duration_weeks: durationWeeks,
        });
        const plan = res?.data?.diet_plan ?? res?.diet_plan ?? res?.data ?? res;
        setDietPlan(plan);
        setShowGenerateForm(false);
      } catch (err) {
        if (err.response?.status === 409) {
          // An active plan already exists — let the user decide what to do with it
          setConflictPlan(err.response.data?.data?.existing_plan ?? {});
          setShowGenerateForm(true);
        } else {
          setGenerateError(
            err.response?.data?.message ||
              'Failed to generate diet plan. Please ensure you have an active medical history and try again.'
          );
        }
      } finally {
        setGenerating(false);
      }
    },
    [id]
  );

  // Called when user picks what to do with the conflicting plan
  const handleConflictResolve = useCallback(
    async (replaceStatus) => {
      setResolving(true);
      setGenerateError(null);
      try {
        const res = await generateDietPlan({
          medical_history_id: id,
          duration_weeks: pendingWeeks,
          force_replace: true,
          replace_with_status: replaceStatus,
        });
        const plan = res?.data?.diet_plan ?? res?.diet_plan ?? res?.data ?? res;
        setDietPlan(plan);
        setConflictPlan(null);
        setShowGenerateForm(false);
      } catch (err) {
        setGenerateError(
          err.response?.data?.message || 'Failed to generate plan after resolving conflict.'
        );
      } finally {
        setResolving(false);
      }
    },
    [id, pendingWeeks]
  );

  const handleLoadAIRecommendations = useCallback(async () => {
    if (aiRecsLoading) return;
    setAiRecsLoading(true);
    setAiRecsError(null);
    try {
      const res = await getAIRecommendations(user.id);
      // Store the full response object — AIRecommendationsPanel handles the structure
      const data = res?.data ?? res;
      setAiRecsData(data);
    } catch (err) {
      setAiRecsError(
        err.response?.data?.message || 'Failed to load AI recommendations. Please try again.'
      );
    } finally {
      setAiRecsLoading(false);
    }
  }, [user?.id, aiRecsLoading]);

  const current = detail;
  const bmi =
    current?.bmi ||
    (current?.height && current?.weight
      ? (Number(current.weight) / Math.pow(Number(current.height) / 100, 2)).toFixed(1)
      : null);
  const bmiInfo = bmiLabel(bmi);
  const patientUser = current?.user || current?.patient_info;
  const displayName = patientUser?.name || user?.name || 'Patient';
  const displayEmail = patientUser?.email || user?.email;
  const accountStatus = patientUser?.account_status;
  const isReviewedByDoctor = !!(current?.reviewed_by_doctor);

  return (
    <ProtectedRoute>
      <Head>
        <title>Medical History Details – Mano App</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/medical-history"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Medical History list
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Link
              href="/dashboard/medical-history"
              className="inline-block mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              ← Back to list
            </Link>
          </div>
        )}

        {!loading && !error && current && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-teal-600 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold">{displayName}</h1>
                  {displayEmail && (
                    <p className="text-teal-100 text-sm mt-0.5">{displayEmail}</p>
                  )}
                  {accountStatus && (
                    <span className="inline-block mt-2 text-xs font-medium bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                      {formatLabel(accountStatus)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-teal-800">
                    {formatLabel(current.goal)}
                  </span>
                  {current.health_risk_level && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-teal-800">
                      {formatLabel(current.health_risk_level)} risk
                    </span>
                  )}
                  <span className="text-teal-100 text-xs">
                    Record:{' '}
                    {formatDate(
                      current.updatedAt ||
                        current.updated_at ||
                        current.createdAt ||
                        current.created_at
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab(TAB_MEDICAL)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === TAB_MEDICAL
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical History
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(TAB_DIET)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === TAB_DIET
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Diet Plan
                {dietPlan && (
                  <span className="ml-1.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* ── Medical History Tab ── */}
            {activeTab === TAB_MEDICAL && (
              <>
                <Section title="Demographics & measurements">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBadge label="Age" value={`${current.age} yrs`} />
                    <StatBadge label="Gender" value={formatLabel(current.gender)} />
                    <StatBadge label="Height" value={`${current.height} cm`} />
                    <StatBadge label="Weight" value={`${current.weight} kg`} />
                    {bmi && <StatBadge label="BMI" value={bmi} sub={bmiInfo?.label} />}
                    <StatBadge label="Lifestyle" value={formatLabel(current.lifestyle)} />
                    {(current.occupation?.name || current.occupation_type) && (
                      <StatBadge
                        label="Occupation"
                        value={current.occupation?.name || formatLabel(current.occupation_type)}
                      />
                    )}
                    {current.is_pregnant && (
                      <StatBadge label="Pregnant" value={`Month ${current.pregnancy_month}`} />
                    )}
                  </div>
                </Section>

                {current.medical_issues?.length > 0 && (
                  <Section title="Medical conditions">
                    <div className="flex flex-wrap gap-2">
                      {current.medical_issues.map((issue) => (
                        <span
                          key={issue}
                          className="text-sm font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100"
                        >
                          {formatLabel(issue)}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {current.medications?.length > 0 && (
                  <Section title="Medications">
                    <div className="space-y-3">
                      {current.medications.map((med, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-start justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {[med.dosage, med.frequency, med.duration].filter(Boolean).join(' · ')}
                            </p>
                            {med.notes && (
                              <p className="text-sm text-gray-600 mt-1">{med.notes}</p>
                            )}
                          </div>
                          {med.start_date && (
                            <span className="text-xs text-gray-400 shrink-0">
                              From {formatDate(med.start_date)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {current.allergies && (
                    <Section title="Allergies">
                      <p className="text-gray-700">{current.allergies}</p>
                    </Section>
                  )}
                  {current.dietary_preferences && (
                    <Section title="Dietary preferences">
                      <p className="text-gray-700">{current.dietary_preferences}</p>
                    </Section>
                  )}
                </div>

                {(current.emergency_contact_name || current.emergency_contact_phone) && (
                  <Section title="Emergency contact">
                    <p className="font-semibold text-gray-900">
                      {current.emergency_contact_name || '—'}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {current.emergency_contact_phone}
                      {current.emergency_contact_relationship &&
                        ` · ${formatLabel(current.emergency_contact_relationship)}`}
                    </p>
                  </Section>
                )}

                {current.gender === 'female' && (
                  <Section title="Women's health">
                    <p className="text-gray-700">
                      {current.is_pregnant
                        ? `Pregnant — Month ${current.pregnancy_month}`
                        : current.menstrual_cycle_issues || 'No issues noted'}
                    </p>
                    {current.other_women_health_issues && (
                      <p className="text-sm text-gray-600 mt-2">
                        {current.other_women_health_issues}
                      </p>
                    )}
                  </Section>
                )}

                {current.doctor_notes && (
                  <Section title="Doctor's notes" className="border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">Doctor review</span>
                      {current.reviewed_at && (
                        <span className="text-xs text-blue-600 ml-auto">
                          {formatDate(current.reviewed_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{current.doctor_notes}</p>
                  </Section>
                )}

                {/* ── Action cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* AI Analysis card */}
                  <div className="bg-linear-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">AI Analysis</h3>
                        <p className="text-xs text-gray-500">
                          Personalized recommendations & diet plan
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* AI Recommendations button */}
                      <button
                        onClick={handleLoadAIRecommendations}
                        disabled={aiRecsLoading}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                      >
                        {aiRecsLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Loading recommendations…
                          </>
                        ) : aiRecsData ? (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Refresh AI Recommendations
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Get AI Recommendations
                          </>
                        )}
                      </button>

                      {/* Generate / View Diet Plan button */}
                      {dietPlan ? (
                        <button
                          onClick={() => setActiveTab(TAB_DIET)}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                          View Diet Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowGenerateForm((v) => !v)}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <Dumbbell className="w-4 h-4" />
                          {showGenerateForm ? 'Hide form' : 'Generate Diet Plan'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doctor Consultation card */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">Doctor Consultation</h3>
                        <p className="text-xs text-gray-500">Request a professional review</p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                        isReviewedByDoctor
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isReviewedByDoctor ? 'bg-green-500' : 'bg-amber-400'
                        }`}
                      />
                      {isReviewedByDoctor
                        ? `Reviewed on ${formatDate(current.reviewed_at)}`
                        : 'Pending doctor review — your record is in the queue'}
                    </div>

                    <Link
                      href="/dashboard/doctors"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find a Doctor
                    </Link>
                  </div>
                </div>

                {/* Generate Diet Plan form (expands below the action cards) */}
                {showGenerateForm && !dietPlan && (
                  <GenerateDietPlanForm
                    onGenerate={handleGenerateDietPlan}
                    generating={generating}
                    generateError={generateError}
                    onCancel={() => { setShowGenerateForm(false); setConflictPlan(null); }}
                    conflictPlan={conflictPlan}
                    onConflictResolve={handleConflictResolve}
                    resolving={resolving}
                    onDismissConflict={() => setConflictPlan(null)}
                  />
                )}

                {/* AI Recommendations panel */}
                {aiRecsError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
                    {aiRecsError}
                  </div>
                )}
                {aiRecsData && (
                  <Section
                    title="AI Health Recommendations"
                    className="border-teal-100 bg-teal-50/30"
                  >
                    <AIRecommendationsPanel data={aiRecsData} />
                  </Section>
                )}

                {/* Fallback: recommendations embedded in the detail record */}
                {!aiRecsData && current.recommendations?.length > 0 && (
                  <Section
                    title="AI Recommendations (from record)"
                    className="border-teal-100 bg-teal-50/30"
                  >
                    <ul className="space-y-2">
                      {current.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/medical-history"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    ← Back to list
                  </Link>
                  <Link
                    href="/dashboard/medical-history/edit"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Edit active record
                  </Link>
                </div>
              </>
            )}

            {/* ── Diet Plan Tab ── */}
            {activeTab === TAB_DIET && (
              <DietPlanDetail
                dietPlan={dietPlan}
                loading={dietPlanLoading}
                error={dietPlanError}
                generating={generating}
                generateError={generateError}
                onGenerate={handleGenerateDietPlan}
                conflictPlan={conflictPlan}
                onConflictResolve={handleConflictResolve}
                resolving={resolving}
                onDismissConflict={() => setConflictPlan(null)}
              />
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
