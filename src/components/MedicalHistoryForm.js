import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { showToast } from './Toast';
import SearchableSelect from './ui/searchable-select';
import {
  GOALS,
  GENDERS,
  MEDICAL_ISSUES,
  LIFESTYLES,
  RELATIONSHIPS,
  MEDICATION_DOSAGES,
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
  PREGNANCY_MONTHS,
} from '../constants/medicalHistory';
import { getOccupations, getMedicationNames } from '../services/medicalHistory';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatLabel = (str) =>
  str ? str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const EMPTY_MEDICATION = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  start_date: '',
  notes: '',
};

const DEFAULT_FORM = {
  goal: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  medical_issues: [],
  medications: [],
  allergies: '',
  lifestyle: '',
  dietary_preferences: '',
  occupation_id: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  is_pregnant: false,
  pregnancy_month: '',
  menstrual_cycle_issues: '',
  other_women_health_issues: '',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ id, icon, title, description, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-50 p-4">{children}</div>}
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const icons = {
  basic: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  issues: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  medications: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  allergies: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  lifestyle: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  occupation: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  emergency: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  women: (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

// ─── Main Form Component ─────────────────────────────────────────────────────

export default function MedicalHistoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Record',
  onCancel,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...(initialData || {}) });
  const [errors, setErrors] = useState({});
  const [occupations, setOccupations] = useState([]);
  const [occupationsLoading, setOccupationsLoading] = useState(true);
  const [occupationsError, setOccupationsError] = useState(null);
  const [medicationNames, setMedicationNames] = useState([]);
  const [open, setOpen] = useState({
    basic: true,
    issues: true,
    medications: true,
    allergies: true,
    lifestyle: true,
    occupation: true,
    emergency: true,
    women: true,
  });

  // Sync if parent passes new initialData (edit mode)
  useEffect(() => {
    if (initialData) setForm({ ...DEFAULT_FORM, ...initialData });
  }, [initialData]);

  // Fetch occupations with loading and error handling
  useEffect(() => {
    setOccupationsLoading(true);
    setOccupationsError(null);
    getOccupations()
      .then((res) => {
        setOccupations(res?.data?.occupations || []);
        setOccupationsError(null);
      })
      .catch(() => {
        setOccupations([]);
        setOccupationsError('Failed to load occupations. Please try again.');
      })
      .finally(() => setOccupationsLoading(false));
  }, []);

  // Fetch medication names
  useEffect(() => {
    getMedicationNames()
      .then((res) => {
        const names = res?.data?.medications || res?.medications || [];
        setMedicationNames(names);
      })
      .catch(() => {});
  }, []);

  const toggleSection = (id) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Field change handlers ──────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleIssue = (issue) => {
    setForm((prev) => ({
      ...prev,
      medical_issues: prev.medical_issues.includes(issue)
        ? prev.medical_issues.filter((i) => i !== issue)
        : [...prev.medical_issues, issue],
    }));
  };

  const addMedication = () =>
    setForm((prev) => ({ ...prev, medications: [...prev.medications, { ...EMPTY_MEDICATION }] }));

  const removeMedication = (idx) =>
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }));

  const handleMedChange = (idx, field, value) =>
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }));

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    if (!form.goal || !form.goal.trim()) errs.goal = 'Health goal is required';
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 150)
      errs.age = 'Enter a valid age (1–150)';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.height || Number(form.height) < 50 || Number(form.height) > 300)
      errs.height = 'Enter a valid height in cm (50–300)';
    if (!form.weight || Number(form.weight) < 20 || Number(form.weight) > 500)
      errs.weight = 'Enter a valid weight in kg (20–500)';
    if (!form.lifestyle) errs.lifestyle = 'Lifestyle is required';
    if (form.is_pregnant && !form.pregnancy_month)
      errs.pregnancy_month = 'Please select the current pregnancy month';
    if (form.emergency_contact_phone && !/^\+?[1-9]\d{1,14}$/.test(form.emergency_contact_phone))
      errs.emergency_contact_phone = 'Use international format e.g. +1234567890';
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('Please fix the highlighted errors before saving.', 'error');
      // Open sections that have errors
      if (errs.goal || errs.age || errs.gender || errs.height || errs.weight)
        setOpen((p) => ({ ...p, basic: true }));
      if (errs.lifestyle) setOpen((p) => ({ ...p, lifestyle: true }));
      if (errs.pregnancy_month) setOpen((p) => ({ ...p, women: true }));
      if (errs.emergency_contact_phone) setOpen((p) => ({ ...p, emergency: true }));
      return;
    }

    const isFemale = form.gender === 'female';
    const payload = {
      goal: form.goal,
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      medical_issues: form.medical_issues,
      medications: form.medications.filter((m) => m.name.trim()),
      allergies: form.allergies || undefined,
      lifestyle: form.lifestyle,
      dietary_preferences: form.dietary_preferences || undefined,
      occupation_id: form.occupation_id || undefined,
      emergency_contact_name: form.emergency_contact_name || undefined,
      emergency_contact_phone: form.emergency_contact_phone || undefined,
      emergency_contact_relationship: form.emergency_contact_relationship || undefined,
      ...(isFemale && {
        is_pregnant: form.is_pregnant,
        pregnancy_month: form.is_pregnant ? Number(form.pregnancy_month) : null,
        menstrual_cycle_issues: !form.is_pregnant ? form.menstrual_cycle_issues || undefined : undefined,
        other_women_health_issues: form.other_women_health_issues || undefined,
      }),
    };

    onSubmit(payload);
  };

  // ── Style helpers ──────────────────────────────────────────────────────────

  const input = (field) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  const select = (field) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  const isFemale = form.gender === 'female';

  // ─── BMI Preview ───────────────────────────────────────────────────────────

  const bmi =
    form.height && form.weight
      ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
      : null;

  const bmiLabel = bmi
    ? bmi < 18.5
      ? { label: 'Underweight', color: 'text-blue-600' }
      : bmi < 25
      ? { label: 'Normal', color: 'text-green-600' }
      : bmi < 30
      ? { label: 'Overweight', color: 'text-amber-600' }
      : { label: 'Obese', color: 'text-red-600' }
    : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* ── 1. Basic Information ── */}
      <SectionCard
        id="basic"
        icon={icons.basic}
        title="Basic Information"
        description="Goal, demographics & physical measurements"
        open={open.basic}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Goal <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={GOALS}
              value={form.goal}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, goal: val }));
                if (errors.goal) setErrors((prev) => ({ ...prev, goal: '' }));
              }}
              getOptionValue={(o) => o.name}
              getOptionLabel={(o) => formatLabel(o.name)}
              placeholder="Select goal"
              emptyMessage="No results found."
              searchPlaceholder="Search goals…"
              error={Boolean(errors.goal)}
            />
            {errors.goal && <p className="mt-0.5 text-xs text-red-500">{errors.goal}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="e.g. 28"
              min="1"
              max="150"
              className={input('age')}
            />
            {errors.age && <p className="mt-0.5 text-xs text-red-500">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={GENDERS}
              value={form.gender}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, gender: val }));
                if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }));
              }}
              getOptionValue={(o) => o.name}
              getOptionLabel={(o) => formatLabel(o.name)}
              placeholder="Select gender"
              emptyMessage="No results found."
              searchPlaceholder="Search gender…"
              error={Boolean(errors.gender)}
            />
            {errors.gender && <p className="mt-0.5 text-xs text-red-500">{errors.gender}</p>}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="e.g. 162"
              min="50"
              max="300"
              step="0.1"
              className={input('height')}
            />
            {errors.height && <p className="mt-0.5 text-xs text-red-500">{errors.height}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="e.g. 68.5"
              min="20"
              max="500"
              step="0.1"
              className={input('weight')}
            />
            {errors.weight && <p className="mt-0.5 text-xs text-red-500">{errors.weight}</p>}
          </div>

          {/* BMI Preview */}
          {bmi && bmiLabel && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Calculated BMI</p>
                <p className={`text-lg font-bold ${bmiLabel.color}`}>{bmi}</p>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                bmiLabel.label === 'Normal' ? 'bg-green-100 text-green-700' :
                bmiLabel.label === 'Underweight' ? 'bg-blue-100 text-blue-700' :
                bmiLabel.label === 'Overweight' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {bmiLabel.label}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── 2. Medical Issues ── */}
      <SectionCard
        id="issues"
        icon={icons.issues}
        title="Medical Issues"
        description="Select all conditions that apply"
        open={open.issues}
        onToggle={toggleSection}
      >
        <div className="flex flex-wrap gap-2">
          {MEDICAL_ISSUES.map((issue) => {
            const selected = form.medical_issues.includes(issue.name);
            return (
              <button
                key={issue.name}
                type="button"
                onClick={() => toggleIssue(issue.name)}
                className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selected
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                {selected && <span className="mr-1">✓</span>}
                {formatLabel(issue.name)}
              </button>
            );
          })}
        </div>
        {form.medical_issues.length > 0 && (
          <p className="mt-3 text-xs text-teal-600 font-medium">
            {form.medical_issues.length} condition{form.medical_issues.length > 1 ? 's' : ''} selected
          </p>
        )}
      </SectionCard>

      {/* ── 3. Medications ── */}
      <SectionCard
        id="medications"
        icon={icons.medications}
        title="Medications"
        description="List current medications with dosage and schedule"
        open={open.medications}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {form.medications.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No medications added yet.</p>
          )}

          {form.medications.map((med, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-700">Medication {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeMedication(idx)}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Medication Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={medicationNames}
                    value={med.name}
                    onChange={(val) => handleMedChange(idx, 'name', val)}
                    getOptionValue={(m) => (typeof m === 'string' ? m : m?.name ?? m?.id ?? '')}
                    getOptionLabel={(m) => (typeof m === 'string' ? m : m?.name ?? m?.id ?? '')}
                    placeholder="Select medication"
                    emptyMessage="No medications available."
                    searchPlaceholder="Search medication…"
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
                  <SearchableSelect
                    options={MEDICATION_DOSAGES}
                    value={med.dosage}
                    onChange={(val) => handleMedChange(idx, 'dosage', val)}
                    getOptionValue={(o) => o.name}
                    getOptionLabel={(o) => o.name}
                    placeholder="Select dosage"
                    emptyMessage="No results found."
                    searchPlaceholder="Search dosage…"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                  <SearchableSelect
                    options={MEDICATION_FREQUENCIES}
                    value={med.frequency}
                    onChange={(val) => handleMedChange(idx, 'frequency', val)}
                    getOptionValue={(o) => o.name}
                    getOptionLabel={(o) => formatLabel(o.name)}
                    placeholder="Select frequency"
                    emptyMessage="No results found."
                    searchPlaceholder="Search frequency…"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                  <SearchableSelect
                    options={MEDICATION_DURATIONS}
                    value={med.duration}
                    onChange={(val) => handleMedChange(idx, 'duration', val)}
                    getOptionValue={(o) => o.name}
                    getOptionLabel={(o) => formatLabel(o.name)}
                    placeholder="Select duration"
                    emptyMessage="No results found."
                    searchPlaceholder="Search duration…"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={med.start_date || ''}
                    onChange={(e) => handleMedChange(idx, 'start_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <input
                    type="text"
                    value={med.notes}
                    onChange={(e) => handleMedChange(idx, 'notes', e.target.value)}
                    placeholder="e.g. Take with food, contains folic acid"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMedication}
            className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 border border-dashed border-teal-300 hover:border-teal-400 px-4 py-2.5 rounded-xl w-full justify-center transition-colors hover:bg-teal-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Medication
          </button>
        </div>
      </SectionCard>

      {/* ── 4. Allergies ── */}
      <SectionCard
        id="allergies"
        icon={icons.allergies}
        title="Allergies"
        description="Known allergies to medications, foods, or substances"
        open={open.allergies}
        onToggle={toggleSection}
      >
        <textarea
          name="allergies"
          value={form.allergies}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Penicillin, shellfish, latex — or 'None known'"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
        />
      </SectionCard>

      {/* ── 5. Lifestyle & Dietary Preferences ── */}
      <SectionCard
        id="lifestyle"
        icon={icons.lifestyle}
        title="Lifestyle & Dietary Preferences"
        description="Activity level and dietary needs"
        open={open.lifestyle}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lifestyle <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={LIFESTYLES}
              value={form.lifestyle}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, lifestyle: val }));
                if (errors.lifestyle) setErrors((prev) => ({ ...prev, lifestyle: '' }));
              }}
              getOptionValue={(o) => o.name}
              getOptionLabel={(o) => formatLabel(o.name)}
              placeholder="Select lifestyle"
              emptyMessage="No results found."
              searchPlaceholder="Search lifestyle…"
              error={Boolean(errors.lifestyle)}
            />
            {errors.lifestyle && <p className="mt-0.5 text-xs text-red-500">{errors.lifestyle}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Preferences
            </label>
            <textarea
              name="dietary_preferences"
              value={form.dietary_preferences}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Vegetarian, no raw fish, limited caffeine, gluten-free"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
            />
          </div>
        </div>
      </SectionCard>

      {/* ── 6. Occupation ── */}
      <SectionCard
        id="occupation"
        icon={icons.occupation}
        title="Occupation"
        description="Select your occupation from the list (searchable)"
        open={open.occupation}
        onToggle={toggleSection}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occupation
          </label>
          {occupationsError && !occupationsLoading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 mb-3">
              <p className="text-sm text-red-700">{occupationsError}</p>
              <button
                type="button"
                onClick={() => {
                  setOccupationsError(null);
                  setOccupationsLoading(true);
                  getOccupations()
                    .then((res) => {
                      setOccupations(res?.data?.occupations || []);
                      setOccupationsError(null);
                    })
                    .catch(() => setOccupationsError('Failed to load occupations. Please try again.'))
                    .finally(() => setOccupationsLoading(false));
                }}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}
          {!occupationsError && (
            <SearchableSelect
              options={occupations}
              value={form.occupation_id}
              onChange={(id) => {
                setForm((prev) => ({ ...prev, occupation_id: id }));
                if (errors.occupation_id) setErrors((prev) => ({ ...prev, occupation_id: '' }));
              }}
              getOptionValue={(o) => o.id}
              getOptionLabel={(o) => o.name}
              placeholder="Select occupation…"
              loading={occupationsLoading}
              emptyMessage="No results found."
              searchPlaceholder="Search occupations…"
              error={Boolean(errors.occupation_id)}
              renderOption={(occ) => (
                <div>
                  <span className="block font-medium">{occ.name}</span>
                  {occ.description && (
                    <span className="block text-xs text-gray-500 mt-0.5 truncate">{occ.description}</span>
                  )}
                </div>
              )}
            />
          )}
          {errors.occupation_id && <p className="mt-0.5 text-xs text-red-500">{errors.occupation_id}</p>}
        </div>
      </SectionCard>

      {/* ── 7. Emergency Contact ── */}
      <SectionCard
        id="emergency"
        icon={icons.emergency}
        title="Emergency Contact"
        description="Person to reach in case of a medical emergency"
        open={open.emergency}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              type="text"
              name="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={input('emergency_contact_name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="emergency_contact_phone"
              value={form.emergency_contact_phone}
              onChange={handleChange}
              placeholder="+1234567890123"
              className={input('emergency_contact_phone')}
            />
            {errors.emergency_contact_phone && (
              <p className="mt-0.5 text-xs text-red-500">{errors.emergency_contact_phone}</p>
            )}
            <p className="mt-0.5 text-xs text-gray-400">International format with country code</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <SearchableSelect
              options={RELATIONSHIPS}
              value={form.emergency_contact_relationship}
              onChange={(val) => setForm((prev) => ({ ...prev, emergency_contact_relationship: val }))}
              getOptionValue={(o) => o.name}
              getOptionLabel={(o) => formatLabel(o.name)}
              placeholder="Select relationship"
              emptyMessage="No results found."
              searchPlaceholder="Search relationship…"
              error={Boolean(errors.emergency_contact_relationship)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── 8. Women's Health (conditional: gender === 'female') ── */}
      {isFemale && (
        <SectionCard
          id="women"
          icon={icons.women}
          title="Women's Health"
          description="Reproductive health and pregnancy information"
          open={open.women}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            {/* Is Pregnant toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Currently Pregnant</p>
                <p className="text-xs text-gray-500 mt-0.5">Enables pregnancy-specific fields below</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    is_pregnant: !prev.is_pregnant,
                    pregnancy_month: !prev.is_pregnant ? prev.pregnancy_month : '',
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                  form.is_pregnant ? 'bg-teal-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={form.is_pregnant}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    form.is_pregnant ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pregnancy Month — shown only if is_pregnant */}
            {form.is_pregnant && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pregnancy Month <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={PREGNANCY_MONTHS}
                  value={form.pregnancy_month}
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, pregnancy_month: val }));
                    if (errors.pregnancy_month) setErrors((prev) => ({ ...prev, pregnancy_month: '' }));
                  }}
                  getOptionValue={(o) => o.name}
                  getOptionLabel={(o) => `Month ${o.name}`}
                  placeholder="Select month"
                  emptyMessage="No results found."
                  searchPlaceholder="Search month…"
                  error={Boolean(errors.pregnancy_month)}
                />
                {errors.pregnancy_month && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.pregnancy_month}</p>
                )}
              </div>
            )}

            {/* Menstrual Cycle Issues — hidden if pregnant */}
            {!form.is_pregnant && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menstrual Cycle Issues
                </label>
                <textarea
                  name="menstrual_cycle_issues"
                  value={form.menstrual_cycle_issues}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Irregular periods, heavy bleeding, PCOS symptoms"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
                />
              </div>
            )}

            {/* Other Women's Health Issues */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Women's Health Issues
              </label>
              <textarea
                name="other_women_health_issues"
                value={form.other_women_health_issues}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Previous gestational diabetes, endometriosis, PCOS"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Submit Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 pb-2">
        Fields marked <span className="text-red-500">*</span> are required.
      </p>
    </form>
  );
}
