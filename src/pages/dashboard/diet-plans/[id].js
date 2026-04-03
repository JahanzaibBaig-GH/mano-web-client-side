import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CalendarDays, TrendingUp, Utensils, Clock, Flame } from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { getDietPlan } from '../../../services/dietPlan';

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

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function MealSlot({ label, meal }) {
  if (!meal) return null;
  const items    = Array.isArray(meal.items) ? meal.items : [];
  const time     = meal.time || (Array.isArray(meal.times) && meal.times[0]) || '—';
  const calories = meal.calories != null ? meal.calories : null;
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <span className="font-semibold text-gray-900 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-amber-500" />
          {label}
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-500">
          {time !== '—' && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {time}
            </span>
          )}
          {calories != null && (
            <span className="flex items-center gap-1 font-medium text-amber-700">
              <Flame className="w-3 h-3 text-amber-400" /> {calories} kcal
            </span>
          )}
        </span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-amber-400 mt-0.5 shrink-0">•</span>
            <span>{typeof item === 'string' ? item : item?.name || JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyMealSchedule({ schedule }) {
  const todayJs   = new Date().getDay(); // 0=Sun…6=Sat
  const todayIdx  = (todayJs + 6) % 7;  // convert to Mon=0…Sun=6
  const [activeDay, setActiveDay] = useState(Math.min(todayIdx, schedule.length - 1));

  const dayData = schedule[activeDay] || schedule[0];

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 flex-wrap">
        {schedule.map((d, i) => {
          const isToday = i === todayIdx;
          const isActive = i === activeDay;
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : isToday
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
              }`}
            >
              {DAY_ABBR[i]}
              {isToday && !isActive && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400 inline-block align-middle" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day heading */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {dayData.day_name}
        {activeDay === todayIdx && (
          <span className="ml-2 text-amber-600 normal-case">(Today)</span>
        )}
      </p>

      {/* Meals for selected day */}
      <div className="space-y-3">
        <MealSlot label="Breakfast" meal={dayData.breakfast} />
        <MealSlot label="Lunch"     meal={dayData.lunch}     />
        <MealSlot label="Dinner"    meal={dayData.dinner}    />
        {dayData.snacks && (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                Snacks
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                {Array.isArray(dayData.snacks.times) && dayData.snacks.times.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dayData.snacks.times.join(' & ')}
                  </span>
                )}
                {dayData.snacks.calories != null && (
                  <span className="flex items-center gap-1 font-medium text-amber-700">
                    <Flame className="w-3 h-3 text-amber-400" /> {dayData.snacks.calories} kcal
                  </span>
                )}
              </span>
            </div>
            <ul className="space-y-1">
              {(Array.isArray(dayData.snacks.items) ? dayData.snacks.items : []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                  <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function LegacyDailyMeals({ meals }) {
  const slots = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch',     label: 'Lunch'     },
    { key: 'dinner',    label: 'Dinner'    },
    { key: 'snacks',    label: 'Snacks'    },
  ];
  return (
    <div className="space-y-3">
      {slots.map(({ key, label }) => {
        const meal = meals[key];
        if (!meal) return null;
        if (key === 'snacks') {
          return (
            <div key={key} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-500" /> {label}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  {Array.isArray(meal.times) && meal.times.length > 0 && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meal.times.join(' & ')}</span>
                  )}
                  {meal.calories != null && (
                    <span className="flex items-center gap-1 font-medium text-amber-700"><Flame className="w-3 h-3 text-amber-400" /> {meal.calories} kcal</span>
                  )}
                </span>
              </div>
              <ul className="space-y-1">
                {(Array.isArray(meal.items) ? meal.items : []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                    <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return <MealSlot key={key} label={label} meal={meal} />;
      })}
    </div>
  );
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DietPlanDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDietPlan(id);
      const plan = res?.data?.diet_plan ?? res?.diet_plan ?? res?.data ?? res;
      setDietPlan(plan);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load diet plan.');
      setDietPlan(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (!id) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-8 text-center text-gray-500">Loading…</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{dietPlan ? `${formatLabel(dietPlan.plan_type)} – Diet Plan` : 'Diet Plan'} – Mano App</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/dashboard/diet-plans"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Diet Plans
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <Link href="/dashboard/diet-plans" className="inline-block mt-4 text-sm text-red-600 hover:underline">
              Return to Diet Plans
            </Link>
          </div>
        ) : !dietPlan ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-amber-700 font-medium">Diet plan not found.</p>
            <Link href="/dashboard/diet-plans" className="inline-block mt-4 text-sm text-amber-600 hover:underline">
              Return to Diet Plans
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {formatLabel((dietPlan.plan_type || '').replace(/_/g, ' '))}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  STATUS_COLORS[dietPlan.status] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatLabel(dietPlan.status)}
              </span>
              {dietPlan.is_active && dietPlan.status === 'active' && (
                <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
              <p className="text-xs text-gray-400 flex items-center gap-1 w-full mt-1">
                <CalendarDays className="w-3 h-3" />
                {formatDate(dietPlan.start_date)}
                {dietPlan.end_date ? ` → ${formatDate(dietPlan.end_date)}` : ''}
              </p>
            </div>

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
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Progress
                  </p>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, dietPlan.progress_percentage))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(dietPlan.progress_percentage)}% complete</p>
                </div>
              )}
            </Section>

            {dietPlan.meals && Object.keys(dietPlan.meals).length > 0 && (
              <Section title={dietPlan.meals.weekly_schedule ? 'Weekly meal schedule' : 'Daily meals'}>
                {Array.isArray(dietPlan.meals.weekly_schedule) && dietPlan.meals.weekly_schedule.length > 0 ? (
                  <WeeklyMealSchedule schedule={dietPlan.meals.weekly_schedule} />
                ) : (
                  <LegacyDailyMeals meals={dietPlan.meals} />
                )}
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
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-medium"
                        >
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

            {dietPlan.notification_preferences &&
              typeof dietPlan.notification_preferences === 'object' && (
                <Section title="Notification preferences">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {dietPlan.notification_preferences.email != null && (
                      <span
                        className={
                          dietPlan.notification_preferences.email ? 'text-gray-800' : 'text-gray-400'
                        }
                      >
                        Email: {dietPlan.notification_preferences.email ? 'On' : 'Off'}
                      </span>
                    )}
                    {dietPlan.notification_preferences.push != null && (
                      <span
                        className={
                          dietPlan.notification_preferences.push ? 'text-gray-800' : 'text-gray-400'
                        }
                      >
                        Push: {dietPlan.notification_preferences.push ? 'On' : 'Off'}
                      </span>
                    )}
                    {dietPlan.notification_preferences.sms != null && (
                      <span
                        className={
                          dietPlan.notification_preferences.sms ? 'text-gray-800' : 'text-gray-400'
                        }
                      >
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
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
