import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Clock,
  Droplets,
  Flame,
  TrendingUp,
  X,
  Target,
  Brain,
  Utensils,
  Moon,
  Heart,
  Dumbbell,
  Activity,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchableSelect from '../../components/ui/searchable-select';
import { useAuth } from '../../hooks/useAuth';
import { listDietPlans, getActiveDietPlan, generateDietPlan } from '../../services/dietPlan';
import { getMedicalHistoryList } from '../../services/medicalHistory';

const formatLabel = (str) =>
  str ? str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/** Sort key for listing — same notion as medical history list (newest first by record creation). */
function planCreatedMs(plan) {
  const raw = plan.created_at ?? plan.createdAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PLAN_TYPE_COLORS = {
  high_protein_low_carb: 'bg-orange-50 text-orange-700',
  balanced_calorie_deficit: 'bg-teal-50 text-teal-700',
  high_calorie_protein_rich: 'bg-purple-50 text-purple-700',
  diabetic_friendly: 'bg-blue-50 text-blue-700',
  low_sodium_heart_healthy: 'bg-red-50 text-red-700',
  balanced_maintenance: 'bg-green-50 text-green-700',
  keto: 'bg-amber-50 text-amber-700',
  mediterranean: 'bg-cyan-50 text-cyan-700',
  vegetarian: 'bg-lime-50 text-lime-700',
  vegan: 'bg-emerald-50 text-emerald-700',
};

// Goal display config — maps medical_history.goal → label, colors, icon
const GOAL_CONFIG = {
  weight_loss:          { label: 'Weight Loss',       Icon: Flame,     bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  weight_gain:          { label: 'Weight Gain',        Icon: Dumbbell,  bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  muscle_gain:          { label: 'Muscle Gain',        Icon: Dumbbell,  bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  maintenance:          { label: 'Maintenance',        Icon: Target,    bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  better_sleep:         { label: 'Better Sleep',       Icon: Moon,      bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  heart_health:         { label: 'Heart Health',       Icon: Heart,     bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  diabetes_management:  { label: 'Diabetes Management',Icon: Activity,  bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200'   },
  general_health:       { label: 'General Health',     Icon: Activity,  bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200'    },
};

// AI model_type → badge display
const AI_MODE_CONFIG = {
  nutritionist_ml: { label: 'Advanced AI',  dot: 'bg-teal-500',   bg: 'bg-teal-50',  text: 'text-teal-700'  },
  dataset_based:   { label: 'Dataset AI',   dot: 'bg-amber-500',  bg: 'bg-amber-50', text: 'text-amber-700' },
  rule_based:      { label: 'Rule-based',   dot: 'bg-orange-500', bg: 'bg-orange-50',text: 'text-orange-700'},
  fallback:        { label: 'Fallback',     dot: 'bg-red-500',    bg: 'bg-red-50',   text: 'text-red-700'   },
};

// ── Card appearance lookup ─────────────────────────────────────────────────────
// Keyed by border-key returned from resolveCardBorderKey().
// Border colors and background tints applied via inline style so they always render.
//
// Border color keyed by border-key
const CARD_BORDER_COLOR = {
  active_approved:    '#16a34a',  // green-600 — doctor approved & running
  active_current:     '#22c55e',  // green-500 — all active (current)
  active_other:       '#22c55e',  // green-500 — all active (same as current)
  completed_approved: '#22c55e',  // green-500
  completed_default:  '#3b82f6',  // blue-500
  paused:             '#9ca3af',  // gray-400
  cancelled_approved: '#b91c1c',  // red-700 — approved then cancelled
  cancelled_reviewed: '#ef4444',  // red-500
  cancelled_default:  '#ef4444',  // red-500 — same as reviewed for consistency
  default:            '#d1d5db',  // gray-300
};

// Card background tint — only doctor-approved and paused get a tinted bg
const CARD_BG_COLOR = {
  active_approved:    '#f0fdf4',  // green-50
  active_current:     '#ffffff',
  active_other:       '#ffffff',
  completed_approved: '#f0fdf4',  // green-50
  completed_default:  '#ffffff',
  paused:             '#f9fafb',  // gray-50
  cancelled_approved: '#fef2f2',  // red-50
  cancelled_reviewed: '#ffffff',
  cancelled_default:  '#ffffff',
  default:            '#ffffff',
};

/**
 * Returns the border key for the plan so both className and inline style can be applied.
 */
function resolveCardBorderKey(plan, isActive) {
  const status = (plan.status && String(plan.status)).toLowerCase();
  const doctor_approved = plan.doctor_approved;
  const reviewed_by_doctor = plan.reviewed_by_doctor;

  if (status === 'active') {
    if (doctor_approved) return 'active_approved';
    if (isActive)        return 'active_current';
    return 'active_other';
  }
  if (status === 'completed') {
    return doctor_approved ? 'completed_approved' : 'completed_default';
  }
  if (status === 'paused') return 'paused';
  if (status === 'cancelled') {
    if (doctor_approved)    return 'cancelled_approved';
    if (reviewed_by_doctor) return 'cancelled_reviewed';
    return 'cancelled_default';
  }
  return 'default';
}


// ── Replace-status options shown in the conflict card ─────────────────────────
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

function PlanCard({ plan, isActive }) {
  const borderKey = resolveCardBorderKey(plan, isActive);
  const borderColor = CARD_BORDER_COLOR[borderKey];
  const bgColor     = CARD_BG_COLOR[borderKey];
  const statusKey = (plan.status && String(plan.status)).toLowerCase();
  const statusColor = STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700';
  const typeColor   = PLAN_TYPE_COLORS[plan.plan_type] ?? 'bg-gray-50 text-gray-700';

  // Goal from linked medical history
  const goalKey  = plan.medical_history?.goal;
  const goalCfg  = GOAL_CONFIG[goalKey];
  const GoalIcon = goalCfg?.Icon ?? Target;

  // AI mode from stored plan_data
  const modelType = plan.plan_data?.model_type;
  const aiCfg     = AI_MODE_CONFIG[modelType];

  // Compact meal preview — pick today's day from weekly_schedule if available
  const meals          = plan.meals ?? {};
  const weeklySchedule = Array.isArray(meals.weekly_schedule) ? meals.weekly_schedule : null;
  const todayJsDay     = new Date().getDay();              // 0=Sun … 6=Sat
  const todayIdx       = (todayJsDay + 6) % 7;            // Mon=0 … Sun=6
  const todayMeals     = weeklySchedule
    ? (weeklySchedule[todayIdx] ?? weeklySchedule[0] ?? {})
    : meals;
  const todayDayName   = weeklySchedule
    ? (weeklySchedule[todayIdx]?.day_name ?? weeklySchedule[0]?.day_name ?? 'Today')
    : null;

  const mealSlots = [
    { key: 'breakfast', label: 'Breakfast', time: todayMeals.breakfast?.time },
    { key: 'lunch',     label: 'Lunch',     time: todayMeals.lunch?.time     },
    { key: 'dinner',    label: 'Dinner',    time: todayMeals.dinner?.time    },
  ].filter((s) => todayMeals[s.key]?.items?.length);

  return (
    <div
      className="rounded-2xl border-2 p-5 space-y-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      {/* ── Row 1: Goal + status badges / confidence ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">

          {/* Goal pill — most prominent, top of card */}
          {goalCfg ? (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${goalCfg.bg} ${goalCfg.text} ${goalCfg.border}`}>
              <GoalIcon className="w-3.5 h-3.5 shrink-0" />
              Goal: {goalCfg.label}
            </div>
          ) : goalKey ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
              <Target className="w-3.5 h-3.5 shrink-0" />
              Goal: {formatLabel(goalKey)}
            </div>
          ) : null}

          {/* Status + plan-type badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
              {formatLabel(plan.status)}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
              {formatLabel(plan.plan_type)}
            </span>
          </div>

          <p className="text-xs text-gray-400 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(plan.start_date)}
            {plan.end_date ? ` → ${formatDate(plan.end_date)}` : ''}
          </p>
        </div>

        {/* AI confidence */}
        {plan.ai_confidence != null && (
          <div className="text-right shrink-0">
            <p className="text-lg font-extrabold text-teal-600">
              {Math.round(Number(plan.ai_confidence) * 100)}%
            </p>
            <p className="text-xs text-gray-400">AI confidence</p>
          </div>
        )}
      </div>

      {/* ── Row 2: Stats grid ── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl p-2 flex flex-col items-center gap-0.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <p className="text-sm font-bold text-gray-900">{plan.daily_calories ?? '—'}</p>
          <p className="text-xs text-gray-500">kcal/day</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2 flex flex-col items-center gap-0.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-sm font-bold text-gray-900">{plan.duration_weeks ?? '—'}</p>
          <p className="text-xs text-gray-500">weeks</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2 flex flex-col items-center gap-0.5">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <p className="text-sm font-bold text-gray-900">{plan.daily_water_goal ?? '—'}</p>
          <p className="text-xs text-gray-500">ml water</p>
        </div>
      </div>

      {/* ── Row 3: Meal preview ── */}
      {mealSlots.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            {todayDayName ? `${todayDayName}'s meals` : "Today's meals"}
          </p>
          {mealSlots.map(({ key, label, time }) => {
            const items = todayMeals[key]?.items ?? [];
            const preview = items.slice(0, 2).join(', ');
            const extra   = items.length > 2 ? ` +${items.length - 2} more` : '';
            return (
              <div key={key} className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-gray-500 w-16 shrink-0">
                  {label}{time ? ` · ${time}` : ''}
                </span>
                <span className="text-xs text-gray-700 truncate">
                  {preview}
                  {extra && <span className="text-gray-400">{extra}</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Row 4: Progress bar ── */}
      {plan.progress_percentage != null && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Progress
            </span>
            <span>{Math.round(plan.progress_percentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, plan.progress_percentage))}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Row 5: AI mode + doctor status ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
        {/* AI mode badge */}
        {aiCfg ? (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${aiCfg.bg} ${aiCfg.text}`}>
            <Brain className="w-3 h-3" />
            <span className={`w-1.5 h-1.5 rounded-full ${aiCfg.dot}`} />
            {aiCfg.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Brain className="w-3 h-3" /> AI
          </span>
        )}

        {/* Doctor review — neutral pill, not alarming red text */}
        {plan.doctor_approved ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Doctor approved
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            Pending doctor review
          </span>
        )}
      </div>
    </div>
  );
}

// ── Conflict resolution card ──────────────────────────────────────────────────
function ConflictCard({ existingPlan, onResolve, resolving, onDismiss }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-gray-900 text-sm">Active plan already exists</p>
          <p className="text-xs text-gray-600 mt-0.5">
            This medical history already has an active diet plan. You must update its status before
            generating a new one.
          </p>
        </div>
        <button onClick={onDismiss} className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Existing plan mini-summary */}
      {existingPlan && (
        <div className="bg-white border border-amber-200 rounded-xl p-3 text-sm space-y-1">
          <p className="font-semibold text-gray-800">{formatLabel(existingPlan.plan_type)}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            Started {formatDate(existingPlan.start_date)}
            {existingPlan.duration_weeks ? ` · ${existingPlan.duration_weeks} weeks` : ''}
          </p>
          {existingPlan.progress_percentage != null && (
            <div className="pt-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, existingPlan.progress_percentage))}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {Math.round(existingPlan.progress_percentage ?? 0)}% complete
              </p>
            </div>
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
            onClick={() => onResolve(status)}
            disabled={resolving}
            className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
          >
            {resolving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs opacity-75">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Generate form ─────────────────────────────────────────────────────────────
function GenerateForm({
  medicalHistories,
  medHistLoading,
  selectedMedHistId,
  onSelectMedHist,
  durationWeeks,
  onDurationChange,
  onGenerate,
  generating,
  generateError,
  onClose,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">Configure your diet plan</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Medical history selector — Shadcn SearchableSelect (same as medical history page) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Medical History</label>
        {!medHistLoading && medicalHistories.length === 0 ? (
          <p className="text-sm text-red-600">
            No medical history found.{' '}
            <Link href="/dashboard/medical-history/create" className="underline font-medium">
              Create one first
            </Link>
            .
          </p>
        ) : (
          <SearchableSelect
            options={medicalHistories}
            value={selectedMedHistId}
            onChange={onSelectMedHist}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) =>
              `${formatLabel(o.goal)} · ${o.age} yrs · ${formatLabel(o.gender)} · ${formatDate(o.createdAt || o.created_at)}`
            }
            placeholder="Select a medical history"
            loading={medHistLoading}
            emptyMessage="No medical histories found."
            searchPlaceholder="Search by goal, date…"
            className="rounded-xl"
          />
        )}
      </div>

      {/* Duration slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700">Duration</label>
          <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg">
            {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={52}
          value={durationWeeks}
          onChange={(e) => onDurationChange(Number(e.target.value))}
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
        onClick={onGenerate}
        disabled={generating || !selectedMedHistId || medHistLoading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-3 rounded-xl transition-colors"
      >
        {generating ? (
          <>
            <LoadingSpinner size="sm" />
            Generating… (may take up to 30 s)
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate {durationWeeks}-week AI Diet Plan
          </>
        )}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DietPlansPage() {
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState(null);

  // Generate form
  const [showForm, setShowForm] = useState(false);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [medHistLoading, setMedHistLoading] = useState(false);
  const [selectedMedHistId, setSelectedMedHistId] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  // Conflict resolution
  const [conflictPlan, setConflictPlan] = useState(null); // existing plan from 409
  const [resolving, setResolving] = useState(false);      // loading during resolution

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    setPlansError(null);
    try {
      const [listRes, activeRes] = await Promise.allSettled([
        listDietPlans({ limit: 20 }),
        getActiveDietPlan(),
      ]);
      if (listRes.status === 'fulfilled') {
        const data = listRes.value?.data?.diet_plans ?? listRes.value?.diet_plans ?? [];
        setPlans(Array.isArray(data) ? data : []);
      }
      if (activeRes.status === 'fulfilled') {
        const plan =
          activeRes.value?.data?.diet_plan ??
          activeRes.value?.diet_plan ??
          activeRes.value?.data ??
          null;
        setActivePlan(plan);
      }
    } catch {
      setPlansError('Failed to load diet plans.');
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // Fetch medical histories when the form is opened
  const openForm = useCallback(async () => {
    setShowForm(true);
    setGenerateError(null);
    setGenerateSuccess(false);
    setConflictPlan(null);
    if (!user?.id) return;
    setMedHistLoading(true);
    try {
      const res = await getMedicalHistoryList(user.id, { limit: 50 });
      const list =
        res?.data?.medical_histories ??
        res?.medical_histories ??
        res?.data?.histories ??
        res?.histories ??
        [];
      setMedicalHistories(Array.isArray(list) ? list : []);
      // Pre-select the first one
      if (list.length > 0 && !selectedMedHistId) {
        setSelectedMedHistId(list[0].id);
      }
    } catch {
      setMedicalHistories([]);
    } finally {
      setMedHistLoading(false);
    }
  }, [user?.id, selectedMedHistId]);

  // Core generation call (reused for both first attempt and after conflict resolution)
  const callGenerate = useCallback(
    async (opts = {}) => {
      const res = await generateDietPlan({
        medical_history_id: selectedMedHistId || undefined,
        duration_weeks: durationWeeks,
        ...opts,
      });
      return res;
    },
    [selectedMedHistId, durationWeeks]
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedMedHistId) {
      setGenerateError('Please select a medical history first.');
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);
    setConflictPlan(null);
    try {
      await callGenerate();
      setGenerateSuccess(true);
      setShowForm(false);
      await fetchPlans();
    } catch (err) {
      if (err.response?.status === 409) {
        // Show the conflict resolution card instead of an error message
        setConflictPlan(err.response.data?.data?.existing_plan ?? {});
      } else {
        setGenerateError(
          err.response?.data?.message ||
            'Failed to generate diet plan. Make sure you have an active medical history first.'
        );
      }
    } finally {
      setGenerating(false);
    }
  }, [selectedMedHistId, callGenerate, fetchPlans]);

  // Called after user picks what to do with the conflicting plan
  const handleConflictResolve = useCallback(
    async (replaceStatus) => {
      setResolving(true);
      setGenerateError(null);
      try {
        await callGenerate({ force_replace: true, replace_with_status: replaceStatus });
        setConflictPlan(null);
        setGenerateSuccess(true);
        setShowForm(false);
        await fetchPlans();
      } catch (err) {
        setGenerateError(
          err.response?.data?.message || 'Failed to generate plan after resolving conflict.'
        );
      } finally {
        setResolving(false);
      }
    },
    [callGenerate, fetchPlans]
  );

  // Enrich the active plan with medical_history from the list response if the
  // active-plan endpoint returned it without that association.
  const enrichedActive = activePlan
    ? {
        ...activePlan,
        medical_history:
          activePlan.medical_history ??
          plans.find((p) => p.id === activePlan.id)?.medical_history ??
          null,
      }
    : null;

  // Merge list + active endpoint (enriched), then sort by created_at DESC like /dashboard/medical-history.
  const planById = new Map(plans.map((p) => [p.id, p]));
  if (enrichedActive) {
    planById.set(enrichedActive.id, enrichedActive);
  }
  const allPlans = [...planById.values()].sort((a, b) => planCreatedMs(b) - planCreatedMs(a));

  return (
    <ProtectedRoute>
      <Head><title>Diet Plans – Mano App</title></Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutri AI — Diet Plans</h1>
            <p className="text-gray-500 text-sm mt-1">
              AI-generated personalized nutrition plans based on your medical history.
            </p>
          </div>
          <button
            onClick={showForm ? () => setShowForm(false) : openForm}
            disabled={loadingPlans}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
          >
            {showForm ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide form
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Generate New Plan
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex gap-3 items-start text-sm text-teal-800">
          <AlertTriangle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">One active plan per medical history</p>
            <p className="mt-0.5 text-teal-700">
              Each medical history tracks its own independent diet plan lifecycle. If you want to
              generate a new plan for a medical history that already has an active plan, you will be
              asked what to do with the current one first. Plans from other medical histories are
              never affected.
            </p>
          </div>
        </div>

        {/* Generate form */}
        {showForm && !conflictPlan && (
          <GenerateForm
            medicalHistories={medicalHistories}
            medHistLoading={medHistLoading}
            selectedMedHistId={selectedMedHistId}
            onSelectMedHist={setSelectedMedHistId}
            durationWeeks={durationWeeks}
            onDurationChange={setDurationWeeks}
            onGenerate={handleGenerate}
            generating={generating}
            generateError={generateError}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Conflict resolution */}
        {conflictPlan && (
          <ConflictCard
            existingPlan={conflictPlan}
            onResolve={handleConflictResolve}
            resolving={resolving}
            onDismiss={() => { setConflictPlan(null); setShowForm(true); }}
          />
        )}

        {/* Success banner */}
        {generateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-green-700 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Diet plan generated successfully!
          </div>
        )}

        {/* Generating overlay */}
        {generating && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <LoadingSpinner />
            <div>
              <p className="font-semibold text-gray-800">Generating your personalized diet plan…</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Our AI is analyzing your medical history. This can take up to 30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* Plans list */}
        {loadingPlans ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : plansError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-sm text-red-600">
            {plansError}
          </div>
        ) : allPlans.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-900">No diet plans yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Click{' '}
                <button onClick={openForm} className="text-amber-600 font-medium hover:text-amber-700 underline">
                  Generate New Plan
                </button>{' '}
                above, or open a{' '}
                <Link href="/dashboard/medical-history" className="text-teal-600 font-medium hover:text-teal-700 underline">
                  medical history record
                </Link>{' '}
                to generate from there.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">
              {allPlans.length} plan{allPlans.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/dashboard/diet-plans/${plan.id}`}
                  className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  <PlanCard plan={plan} isActive={enrichedActive?.id === plan.id} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
