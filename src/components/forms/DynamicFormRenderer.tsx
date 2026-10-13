'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  DynamicFieldType,
  FormFieldInput,
  AppointmentSlotDTO,
  AppointmentScheduleConfig,
} from '@/types/dynamic-form';
import { getFieldSlotsAction, submitDynamicFormAction } from '@/actions/form-actions';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Globe,
  Sparkles,
  Info,
} from 'lucide-react';

interface FormProps {
  formId: string;
  title: string;
  description?: string;
  fields: FormFieldInput[];
}

/**
 * Interactive Calendar Date Picker
 * Enforces:
 *  - Disabling past dates (today or earlier)
 *  - Enforcing maxDaysInAdvance (e.g. 10 days)
 *  - Enforcing bookingCutoffDate (e.g. 2026-10-31)
 *  - Enforcing allowed days of week (e.g. Mon-Fri)
 */
function AppointmentCalendarPicker({
  selectedDate,
  onSelectDate,
  config,
  clientTz,
}: {
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  config?: AppointmentScheduleConfig;
  clientTz: string;
}) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  // Today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Maximum advance booking boundary
  const maxDays = config?.maxDaysInAdvance ?? 14;
  const maxAdvanceDate = new Date(today);
  maxAdvanceDate.setDate(today.getDate() + maxDays);
  maxAdvanceDate.setHours(23, 59, 59, 999);

  // Hard cutoff date
  const cutoffDate = config?.bookingCutoffDate ? new Date(`${config.bookingCutoffDate}T23:59:59Z`) : null;

  // Allowed days of the week (default Monday-Friday)
  const allowedDays = config?.daysOfWeek || [1, 2, 3, 4, 5];

  // Month navigation
  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Prevent navigating to months before the current month
  const isPrevDisabled =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  // Prevent navigating beyond max advance window
  const isNextDisabled =
    new Date(currentYear, currentMonth + 1, 1) > maxAdvanceDate &&
    (!cutoffDate || new Date(currentYear, currentMonth + 1, 1) > cutoffDate);

  // Days in month calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(viewDate);

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Month Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-white uppercase tracking-wider">
            {monthName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isPrevDisabled}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={isNextDisabled}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Booking Window Hint */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>
            Advance booking open up to {maxDays} days ahead
            {config?.bookingCutoffDate ? ` (closes ${config.bookingCutoffDate})` : ''}
          </span>
        </span>
        <span className="text-slate-500 font-mono">Past dates disabled</span>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-500 tracking-wider">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs">
        {/* Padding for days before the 1st */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const cellDate = new Date(currentYear, currentMonth, dayNum);
          cellDate.setHours(0, 0, 0, 0);

          const dateIsoString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
            dayNum
          ).padStart(2, '0')}`;

          const isPast = cellDate < today;
          const isBeyondAdvance = cellDate > maxAdvanceDate;
          const isAfterCutoff = cutoffDate ? cellDate > cutoffDate : false;
          const isDayAllowed = allowedDays.includes(cellDate.getDay());

          const isDisabled = isPast || isBeyondAdvance || isAfterCutoff || !isDayAllowed;
          const isSelected = selectedDate === dateIsoString;
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateIsoString)}
              className={`relative p-2.5 sm:p-3 rounded-xl transition-all flex flex-col items-center justify-center font-semibold ${
                isDisabled
                  ? 'text-slate-700 bg-slate-900/20 cursor-not-allowed line-through decoration-slate-800'
                  : isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-2 ring-white scale-105'
                  : 'bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-white cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-xs sm:text-sm">{dayNum}</span>
              {isToday && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" title="Today" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DynamicFormRenderer({
  formId,
  title,
  description,
  fields,
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [appointmentFieldId, setAppointmentFieldId] = useState<string>('');
  const [appointmentConfig, setAppointmentConfig] = useState<AppointmentScheduleConfig | undefined>(undefined);

  // Slot fetching state - Date selection required first!
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clientTz, setClientTz] = useState('UTC');

  // Submission state
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientTz(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    }

    const appField = fields.find((f) => f.type === 'APPOINTMENT');
    if (appField?.id) {
      setAppointmentFieldId(appField.id);
      setAppointmentConfig(appField.appointmentConfig);
    }
  }, [fields]);

  // Load slots for the selected date
  const loadSlotsForDate = async (dateStr: string, fieldId: string) => {
    if (!fieldId) return;
    setLoadingSlots(true);
    try {
      const res = await getFieldSlotsAction({
        fieldId,
        startDate: dateStr,
        endDate: dateStr,
        viewerTimezone: clientTz,
      });

      if (res.success && res.slots) {
        setAvailableSlots(res.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (e) {
      console.error(e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlotId(''); // Reset previously selected slot
    if (appointmentFieldId) {
      loadSlotsForDate(dateStr, appointmentFieldId);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxToggle = (fieldId: string, optionValue: string) => {
    setFormData((prev) => {
      const currentList: string[] = prev[fieldId] || [];
      const nextList = currentList.includes(optionValue)
        ? currentList.filter((v) => v !== optionValue)
        : [...currentList, optionValue];
      return { ...prev, [fieldId]: nextList };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Build normalized answers
    const answers = fields.map((field) => {
      const val = formData[field.id || ''];
      const isAppField = field.type === 'APPOINTMENT';

      return {
        fieldId: field.id || '',
        answerValue: Array.isArray(val) ? val.join(', ') : String(val || ''),
        jsonValue: Array.isArray(val) ? val : undefined,
        slotId: isAppField ? selectedSlotId : undefined,
      };
    });

    startTransition(async () => {
      const res = await submitDynamicFormAction({
        formId,
        answers,
        clientTimezone: clientTz,
      });

      if (res.success && res.submissionId) {
        setIsSuccess(true);
        setSubmissionId(res.submissionId);
      } else {
        setSubmitError(res.error || 'Failed to submit form.');
        // If an appointment error occurred, refresh slots so the user sees updated capacity
        if (appointmentFieldId && selectedDate) {
          loadSlotsForDate(selectedDate, appointmentFieldId);
        }
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-slate-950 text-white rounded-3xl border border-emerald-500/30 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Submission Confirmed!</h2>
          <p className="text-sm text-slate-300">
            Your form response and appointment reservation have been securely recorded.
          </p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-400 font-mono">
          Submission ID: {submissionId}
        </div>
        <button
          onClick={() => {
            setIsSuccess(false);
            setFormData({});
            setSelectedSlotId('');
            setSelectedDate(null);
          }}
          className="text-xs font-bold text-amber-400 hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
      {/* Title & Description */}
      <div className="space-y-2 pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
        {description && <p className="text-sm text-slate-300 leading-relaxed">{description}</p>}
      </div>

      {submitError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-sm text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Submission Error</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field, idx) => {
          const fieldKey = field.id || `field_${idx}`;
          const isRequired = field.isRequired;

          return (
            <div key={fieldKey} className="space-y-2">
              <label className="block text-sm font-bold text-slate-200">
                {field.label}
                {isRequired && <span className="text-amber-500 ml-1">*</span>}
              </label>

              {field.helpText && <p className="text-xs text-slate-400">{field.helpText}</p>}

              {/* TEXT */}
              {field.type === 'TEXT' && (
                <input
                  type="text"
                  required={isRequired}
                  placeholder={field.placeholder || ''}
                  value={formData[fieldKey] || ''}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              )}

              {/* TEXTAREA */}
              {field.type === 'TEXTAREA' && (
                <textarea
                  rows={3}
                  required={isRequired}
                  placeholder={field.placeholder || ''}
                  value={formData[fieldKey] || ''}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              )}

              {/* SELECT */}
              {field.type === 'SELECT' && (
                <select
                  required={isRequired}
                  value={formData[fieldKey] || ''}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select an option...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* RADIO */}
              {field.type === 'RADIO' && (
                <div className="space-y-2 pt-1">
                  {(field.options || []).map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name={fieldKey}
                        required={isRequired && !formData[fieldKey]}
                        value={opt.value}
                        checked={formData[fieldKey] === opt.value}
                        onChange={() => handleInputChange(fieldKey, opt.value)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* CHECKBOX */}
              {field.type === 'CHECKBOX' && (
                <div className="space-y-2 pt-1">
                  {(field.options || []).map((opt) => {
                    const currentValues: string[] = formData[fieldKey] || [];
                    const checked = currentValues.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxToggle(fieldKey, opt.value)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* DATE */}
              {field.type === 'DATE' && (
                <input
                  type="date"
                  required={isRequired}
                  value={formData[fieldKey] || ''}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              )}

              {/* APPOINTMENT SLOT PICKER: CALENDAR FIRST, THEN TIME SLOTS */}
              {field.type === 'APPOINTMENT' && (
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-amber-500/20 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Step 1: Select Consultation Date
                    </span>
                    <span className="flex items-center gap-1 text-[11px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                      <Globe className="w-3 h-3 text-amber-400" />
                      Your Timezone: {clientTz}
                    </span>
                  </div>

                  {/* Clean Visual Interactive Calendar View */}
                  <AppointmentCalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    config={field.appointmentConfig || appointmentConfig}
                    clientTz={clientTz}
                  />

                  {/* Step 2: Available Slots for Selected Date */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Step 2: Choose Available Slot
                      </span>
                      {selectedDate && (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                          Date: {selectedDate}
                        </span>
                      )}
                    </div>

                    {!selectedDate ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-1">
                        <CalendarIcon className="w-6 h-6 text-slate-600 mx-auto" />
                        <span className="font-semibold text-slate-300 block">No Date Selected</span>
                        <span>Please select an open date on the calendar above to view available time slots.</span>
                      </div>
                    ) : loadingSlots ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Checking available slots for {selectedDate}...</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-1">
                        <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                        <span className="font-semibold text-slate-300 block">No Available Slots</span>
                        <span>All slots on {selectedDate} have been booked or passed. Please choose another date.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isFull = !slot.isAvailable;
                          const isSelected = selectedSlotId === slot.id;

                          // Format start and end time (e.g. 1:30 PM – 2:00 PM) in client timezone
                          const displayTime = (() => {
                            if (slot.formattedTimeRange) return slot.formattedTimeRange;
                            try {
                              const start = new Date(slot.startTime);
                              const end = new Date(slot.endTime);
                              const fmt = new Intl.DateTimeFormat('en-US', {
                                timeZone: clientTz,
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              });
                              return `${fmt.format(start)} – ${fmt.format(end)}`;
                            } catch {
                              return slot.formattedLocalTime || 'Time Slot';
                            }
                          })();

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={isFull}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                isFull
                                  ? 'bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500 text-white shadow-lg'
                                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold font-mono tracking-tight text-white">
                                  {displayTime}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] mt-1.5 flex items-center justify-between">
                                <span
                                  className={
                                    isFull
                                      ? 'text-rose-400 font-bold'
                                      : slot.remainingCapacity === 1
                                      ? 'text-amber-400 font-bold'
                                      : 'text-emerald-400 font-medium'
                                  }
                                >
                                  {isFull
                                    ? 'Fully Booked'
                                    : `${slot.remainingCapacity} spot${slot.remainingCapacity === 1 ? '' : 's'} available`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-base transition-all shadow-xl shadow-amber-500/20 active:scale-98 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting & Locking Appointment...</span>
              </>
            ) : (
              <>
                <span>Submit Form</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
