'use client';

import React, { useState, useTransition } from 'react';
import {
  DynamicFieldType,
  FormFieldInput,
  FormConfigInput,
  AppointmentScheduleConfig,
} from '@/types/dynamic-form';
import { saveFormConfigAction, toggleFormPublishAction } from '@/actions/form-actions';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Settings,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

const FIELD_TYPES: { type: DynamicFieldType; label: string; icon: string }[] = [
  { type: 'TEXT', label: 'Short Text', icon: '📝' },
  { type: 'TEXTAREA', label: 'Long Text', icon: '📄' },
  { type: 'SELECT', label: 'Dropdown Select', icon: '🔽' },
  { type: 'RADIO', label: 'Radio Choice', icon: '🔘' },
  { type: 'CHECKBOX', label: 'Multi-Checkbox', icon: '☑️' },
  { type: 'DATE', label: 'Date Picker', icon: '📅' },
  { type: 'APPOINTMENT', label: 'Appointment Slot', icon: '⏱️' },
];

interface Props {
  initialForm?: FormConfigInput;
  onSaved?: (formId: string) => void;
}

export default function DynamicFormBuilder({ initialForm, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialForm?.title || 'Community Consultation & Booking');
  const [description, setDescription] = useState(
    initialForm?.description || 'Please fill in the required details and select a convenient appointment time.'
  );
  const [isPublished, setIsPublished] = useState(initialForm?.isPublished || false);
  const [formId, setFormId] = useState(initialForm?.id || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [fields, setFields] = useState<FormFieldInput[]>(
    initialForm?.fields || [
      {
        label: 'Full Name',
        type: 'TEXT',
        placeholder: 'e.g. Anjali Sharma',
        isRequired: true,
        orderIndex: 0,
      },
      {
        label: 'Email Address',
        type: 'TEXT',
        placeholder: 'anjali@example.com',
        isRequired: true,
        orderIndex: 1,
      },
      {
        label: 'Consultation Category',
        type: 'SELECT',
        isRequired: true,
        orderIndex: 2,
        options: [
          { label: 'Event Volunteering', value: 'volunteering' },
          { label: 'Community Support & Welfare', value: 'support' },
          { label: 'Sponsorship & Partnerships', value: 'sponsorship' },
        ],
      },
      {
        label: 'Book Consultation Slot',
        type: 'APPOINTMENT',
        isRequired: true,
        orderIndex: 3,
        appointmentConfig: {
          startTime: '09:00',
          endTime: '17:00',
          intervalMinutes: 30,
          maxCapacity: 2,
          daysOfWeek: [1, 2, 3, 4, 5],
          timezone: 'Europe/London',
        },
      },
    ]
  );

  const addField = (type: DynamicFieldType) => {
    const newField: FormFieldInput = {
      label: `New ${type.toLowerCase()} field`,
      type,
      isRequired: false,
      orderIndex: fields.length,
      options:
        ['SELECT', 'RADIO', 'CHECKBOX'].includes(type)
          ? [
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
            ]
          : undefined,
      appointmentConfig:
        type === 'APPOINTMENT'
          ? {
              startTime: '09:00',
              endTime: '17:00',
              intervalMinutes: 30,
              maxCapacity: 1,
              daysOfWeek: [1, 2, 3, 4, 5],
              timezone: 'UTC',
            }
          : undefined,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    // Re-index remaining fields
    setFields(updated.map((f, i) => ({ ...f, orderIndex: i })));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setFields(reordered.map((f, i) => ({ ...f, orderIndex: i })));
  };

  const updateField = (index: number, patch: Partial<FormFieldInput>) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const updateAppointmentConfig = (
    index: number,
    patch: Partial<AppointmentScheduleConfig>
  ) => {
    setFields((prev) => {
      const copy = [...prev];
      const current = copy[index].appointmentConfig || {
        startTime: '09:00',
        endTime: '17:00',
        intervalMinutes: 30,
        maxCapacity: 1,
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: 'UTC',
      };
      copy[index] = {
        ...copy[index],
        appointmentConfig: { ...current, ...patch },
      };
      return copy;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      setFeedback(null);
      const res = await saveFormConfigAction({
        id: formId || undefined,
        title,
        description,
        isPublished,
        fields,
      });

      if (res.success) {
        setFormId(res.formId);
        setFeedback({
          type: 'success',
          message: 'Form configuration and fields saved successfully!',
        });
        if (onSaved) onSaved(res.formId);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save form.',
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Dynamic Form & Appointment Builder</span>
          </div>
          <h1 className="text-2xl font-black text-white">Form Studio</h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-semibold">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <span className={isPublished ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {isPublished ? '● Published' : '○ Draft (Unpublished)'}
            </span>
          </label>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Metadata */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Form Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
            placeholder="e.g. VIP Pooja Registration & Priest Consultation"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Description / Instructions
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder="Help text displayed to respondents..."
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
            Form Questions ({fields.length})
          </h2>
          <span className="text-xs text-slate-400">Order is strictly preserved by orderIndex</span>
        </div>

        {fields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
            No fields added yet. Choose a field type below to get started.
          </div>
        ) : (
          fields.map((field, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    {field.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => moveField(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveField(idx, 'down')}
                    disabled={idx === fields.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeField(idx)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg ml-2"
                    title="Remove Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Field Label & Required Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-9">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    placeholder="Question Label..."
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateField(idx, { isRequired: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>Required</span>
                  </label>
                </div>
              </div>

              {/* Choices editor for SELECT, RADIO, CHECKBOX */}
              {['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type) && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Available Choices</div>
                  <div className="space-y-1.5">
                    {(field.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const updatedOptions = [...(field.options || [])];
                            updatedOptions[optIdx] = {
                              label: e.target.value,
                              value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                            };
                            updateField(idx, { options: updatedOptions });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          placeholder={`Option ${optIdx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions = (field.options || []).filter((_, i) => i !== optIdx);
                            updateField(idx, { options: updatedOptions });
                          }}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const currentOpts = field.options || [];
                        updateField(idx, {
                          options: [
                            ...currentOpts,
                            {
                              label: `Option ${currentOpts.length + 1}`,
                              value: `option_${currentOpts.length + 1}`,
                            },
                          ],
                        });
                      }}
                      className="text-xs text-amber-400 font-bold hover:underline pt-1 inline-flex items-center gap-1"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Appointment Schedule Settings */}
              {field.type === 'APPOINTMENT' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Appointment Schedule & Concurrency Policy</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Start Time (Day)</label>
                      <input
                        type="time"
                        value={field.appointmentConfig?.startTime || '09:00'}
                        onChange={(e) => updateAppointmentConfig(idx, { startTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">End Time (Day)</label>
                      <input
                        type="time"
                        value={field.appointmentConfig?.endTime || '17:00'}
                        onChange={(e) => updateAppointmentConfig(idx, { endTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Interval (Mins)</label>
                      <select
                        value={field.appointmentConfig?.intervalMinutes || 30}
                        onChange={(e) =>
                          updateAppointmentConfig(idx, { intervalMinutes: Number(e.target.value) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Max Capacity / Slot</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={field.appointmentConfig?.maxCapacity || 1}
                        onChange={(e) =>
                          updateAppointmentConfig(idx, { maxCapacity: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-xs">Host Reference Timezone</label>
                    <select
                      value={field.appointmentConfig?.timezone || 'Europe/London'}
                      onChange={(e) => updateAppointmentConfig(idx, { timezone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Europe/London">Europe/London (GMT / BST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST / EDT)</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                    </select>
                  </div>

                  {/* Advance Booking Limit & Cutoff Configuration */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Booking Window &amp; Advance Cutoff Rules
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">
                          Max Days in Advance
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          placeholder="e.g. 10 days"
                          value={field.appointmentConfig?.maxDaysInAdvance ?? 14}
                          onChange={(e) =>
                            updateAppointmentConfig(idx, {
                              maxDaysInAdvance: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          e.g. 10: slots disabled after 10 days
                        </span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">
                          Hard Cutoff Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={field.appointmentConfig?.bookingCutoffDate || ''}
                          onChange={(e) =>
                            updateAppointmentConfig(idx, {
                              bookingCutoffDate: e.target.value || undefined,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          No bookings allowed after this date
                        </span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">
                          Minimum Notice (Hours)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={72}
                          value={field.appointmentConfig?.minNoticeHours ?? 2}
                          onChange={(e) =>
                            updateAppointmentConfig(idx, {
                              minNoticeHours: Number(e.target.value),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Buffer before slot start time
                        </span>
                      </div>
                    </div>

                    {/* Active Days of Week */}
                    <div>
                      <label className="text-slate-400 block mb-1 text-xs">Available Days of Week</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Mon', day: 1 },
                          { label: 'Tue', day: 2 },
                          { label: 'Wed', day: 3 },
                          { label: 'Thu', day: 4 },
                          { label: 'Fri', day: 5 },
                          { label: 'Sat', day: 6 },
                          { label: 'Sun', day: 0 },
                        ].map(({ label, day }) => {
                          const currentDays = field.appointmentConfig?.daysOfWeek || [1, 2, 3, 4, 5];
                          const isActive = currentDays.includes(day);

                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                const nextDays = isActive
                                  ? currentDays.filter((d) => d !== day)
                                  : [...currentDays, day];
                                updateAppointmentConfig(idx, { daysOfWeek: nextDays });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Field Palette */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Add New Form Field
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.type}
              type="button"
              onClick={() => addField(ft.type)}
              className="flex items-center gap-2 p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-semibold text-slate-200 transition-all text-left"
            >
              <span>{ft.icon}</span>
              <span>{ft.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
