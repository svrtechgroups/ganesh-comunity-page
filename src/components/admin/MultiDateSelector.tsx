'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  X,
  ArrowRight,
  Trash2,
  CalendarRange,
  Edit3,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  Check
} from 'lucide-react';
import { EventScheduleDay } from '@/lib/types';
import { DEFAULT_GANESH_SCHEDULE } from '@/lib/event-schedule';

interface MultiDateSelectorProps {
  dates: string[];
  onChange: (dates: string[]) => void;
  schedule?: EventScheduleDay[];
  onScheduleChange?: (schedule: EventScheduleDay[]) => void;
  label?: string;
  helperText?: string;
}

// Formats a YYYY-MM-DD date string into "DD MMM YYYY" (e.g. "13 Sep 2026")
function formatDateString(isoDateStr: string): string {
  try {
    const [y, m, d] = isoDateStr.split('-').map(Number);
    if (!y || !m || !d) return isoDateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDateStr;
  }
}

// Extracts day of week from YYYY-MM-DD
function getDayOfWeek(isoDateStr: string): string {
  try {
    const [y, m, d] = isoDateStr.split('-').map(Number);
    if (!y || !m || !d) return '';
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
  } catch {
    return '';
  }
}

export default function MultiDateSelector({
  dates = [],
  onChange,
  schedule = [],
  onScheduleChange,
  label = 'Select Darshan / Event Date(s) for RSVP & Schedule',
  helperText = 'Pick multiple event days or date ranges. You can customize the sacred ritual, deity name, and theme for each day directly below.',
}: MultiDateSelectorProps) {
  const [singleDate, setSingleDate] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [showRangeAdder, setShowRangeAdder] = useState(false);
  const [textEditMode, setTextEditMode] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editItemState, setEditItemState] = useState<Partial<EventScheduleDay>>({});
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  // Helper to sync schedule whenever dates are added or removed
  const syncScheduleWithDates = (newDates: string[]) => {
    onChange(newDates);

    if (!onScheduleChange) return;

    const existingMap = new Map<string, EventScheduleDay>();
    (schedule || []).forEach((s) => {
      existingMap.set(s.dateLabel || s.date, s);
      existingMap.set(s.date, s);
    });

    const updatedSchedule: EventScheduleDay[] = newDates.map((d, idx) => {
      if (existingMap.has(d)) {
        return existingMap.get(d)!;
      }
      return {
        id: `day-${Date.now()}-${idx}`,
        date: d,
        dateLabel: d,
        day: '',
        title: `Event Day - ${d}`,
        theme: '',
      };
    });

    onScheduleChange(updatedSchedule);
  };

  // Switch to raw text mode
  const handleToggleTextMode = () => {
    if (!textEditMode) {
      setRawTextInput(dates.join(', '));
    } else {
      const parsed = rawTextInput
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      syncScheduleWithDates(parsed);
    }
    setTextEditMode(!textEditMode);
  };

  const handleApplyRawText = () => {
    const parsed = rawTextInput
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    syncScheduleWithDates(parsed);
    setTextEditMode(false);
  };

  const handleAddSingleDate = () => {
    if (!singleDate) return;
    const formatted = formatDateString(singleDate);
    const dayOfWeek = getDayOfWeek(singleDate);

    if (!dates.includes(formatted)) {
      const newDates = [...dates, formatted];
      onChange(newDates);

      if (onScheduleChange) {
        const newScheduleItem: EventScheduleDay = {
          id: `day-${Date.now()}`,
          date: formatted,
          dateLabel: formatted,
          day: dayOfWeek,
          title: `Event Day - ${formatted}`,
          theme: '',
        };
        onScheduleChange([...(schedule || []), newScheduleItem]);
      }
    }
    setSingleDate('');
  };

  const handleAddRangeDates = () => {
    if (!rangeStart || !rangeEnd) return;
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (start > end) {
      alert('Start date must be before or equal to end date');
      return;
    }

    const newDates: string[] = [...dates];
    const newScheduleItems: EventScheduleDay[] = [...(schedule || [])];
    const current = new Date(start);
    let count = 0;

    while (current <= end && count < 60) {
      const formatted = current.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const dayOfWeek = current.toLocaleDateString('en-GB', { weekday: 'long' });

      if (!newDates.includes(formatted)) {
        newDates.push(formatted);
        newScheduleItems.push({
          id: `day-${Date.now()}-${count}`,
          date: formatted,
          dateLabel: formatted,
          day: dayOfWeek,
          title: `Event Day - ${formatted}`,
          theme: '',
        });
      }
      current.setDate(current.getDate() + 1);
      count++;
    }

    onChange(newDates);
    if (onScheduleChange) onScheduleChange(newScheduleItems);

    setRangeStart('');
    setRangeEnd('');
    setShowRangeAdder(false);
  };

  const handleRemoveDate = (indexToRemove: number) => {
    const targetDate = dates[indexToRemove];
    const newDates = dates.filter((_, i) => i !== indexToRemove);
    onChange(newDates);

    if (onScheduleChange && schedule) {
      const newSchedule = schedule.filter(
        (s) => s.date !== targetDate && s.dateLabel !== targetDate
      );
      onScheduleChange(newSchedule);
    }
    if (editingDayIndex === indexToRemove) {
      setEditingDayIndex(null);
    }
  };

  const handleClearAll = () => {
    if (dates.length === 0) return;
    if (confirm('Clear all selected dates and schedule?')) {
      onChange([]);
      if (onScheduleChange) onScheduleChange([]);
      setEditingDayIndex(null);
    }
  };

  const handleApplyGaneshPreset = () => {
    const ganeshDates = DEFAULT_GANESH_SCHEDULE.map((s) => s.dateLabel || s.date);
    onChange(ganeshDates);
    if (onScheduleChange) {
      onScheduleChange(DEFAULT_GANESH_SCHEDULE);
    }
    setViewMode('detailed');
  };

  const startEditScheduleItem = (index: number) => {
    const dateStr = dates[index];
    const item =
      schedule.find((s) => s.date === dateStr || s.dateLabel === dateStr) || {
        id: `day-${index + 1}`,
        date: dateStr,
        dateLabel: dateStr,
        day: '',
        title: `Festival Day - ${dateStr}`,
        theme: '',
      };

    setEditingDayIndex(index);
    setEditItemState({ ...item });
  };

  const saveEditScheduleItem = (index: number) => {
    if (!onScheduleChange) {
      setEditingDayIndex(null);
      return;
    }

    const dateStr = dates[index];
    const updated = [...(schedule || [])];
    const existingIdx = updated.findIndex((s) => s.date === dateStr || s.dateLabel === dateStr);

    const savedItem: EventScheduleDay = {
      id: editItemState.id || `day-${index + 1}`,
      date: editItemState.date || dateStr,
      dateLabel: editItemState.dateLabel || editItemState.date || dateStr,
      day: editItemState.day || '',
      title: editItemState.title || `Day - ${dateStr}`,
      theme: editItemState.theme || '',
      blessing: editItemState.blessing || '',
      badge: editItemState.badge || undefined,
    };

    if (existingIdx >= 0) {
      updated[existingIdx] = savedItem;
    } else {
      updated.push(savedItem);
    }

    onScheduleChange(updated);
    setEditingDayIndex(null);
  };

  return (
    <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
      {/* Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <label className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-mitra-gold" />
            <span>{label}</span>
            <span className="text-mitra-gold font-normal">({dates.length} Days)</span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          {dates.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
              className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1 transition-colors"
            >
              {viewMode === 'detailed' ? (
                <>
                  <ChevronUp className="w-3 h-3 text-slate-400" />
                  <span>Compact Chips</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                  <span>Detailed Schedule</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleTextMode}
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-slate-400" />
            <span>{textEditMode ? 'Visual Picker' : 'Paste Dates'}</span>
          </button>

          {dates.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 hover:bg-red-950/80 border border-red-900/40 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Raw Text Edit Mode */}
      {textEditMode ? (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            placeholder="e.g. 13 Sep 2026, 14 Sep 2026, 15 Sep 2026, 16 Sep 2026"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTextEditMode(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyRawText}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 rounded-lg shadow flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Dates</span>
            </button>
          </div>
        </div>
      ) : (
        /* Visual Date Pickers & Generator Bar */
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            {/* Single Date Picker */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg flex-1 focus:outline-none focus:border-mitra-gold [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={handleAddSingleDate}
                disabled={!singleDate}
                className="px-3 py-1.5 bg-mitra-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            {/* Toggle Date Range Adder */}
            <button
              type="button"
              onClick={() => setShowRangeAdder(!showRangeAdder)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors shrink-0 ${
                showRangeAdder
                  ? 'bg-amber-500/20 text-mitra-gold border-mitra-gold/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-mitra-gold" />
              <span>{showRangeAdder ? 'Close Range' : '+ Date Range'}</span>
            </button>

            {/* ⚡ Ganesh Mahotsav 8 Days Preset Button */}
            <button
              type="button"
              onClick={handleApplyGaneshPreset}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-950/80 border border-amber-800/50 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Auto-load 8 Ganesh Mahotsav Days with Deities, Rituals & Themes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Load 8-Day Ganesh Preset</span>
            </button>
          </div>

          {/* Date Range Sub-Form */}
          {showRangeAdder && (
            <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl space-y-2 animate-in fade-in">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Generate Daily Dates in Range
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>From:</span>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg [color-scheme:dark]"
                  />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>To:</span>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg [color-scheme:dark]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRangeDates}
                  disabled={!rangeStart || !rangeEnd}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add All Days in Range</span>
                </button>
              </div>
            </div>
          )}

          {/* ── SCHEDULE DAYS LIST ──────────────────────────────────────── */}
          {dates.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
              <Calendar className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No dates added yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pick dates above or click &ldquo;⚡ Load 8-Day Ganesh Preset&rdquo; to populate the festival schedule.
              </p>
            </div>
          ) : viewMode === 'compact' ? (
            /* Compact Chips View */
            <div className="flex flex-wrap gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              {dates.map((d, index) => (
                <span
                  key={`${d}-${index}`}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm hover:border-amber-500/60 transition-colors group"
                >
                  <Calendar className="w-3 h-3 text-mitra-gold shrink-0" />
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(index)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                    title="Remove date"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            /* Detailed Schedule List with Inline Customization */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Configure Sacred Ritual / Deity details for each scheduled day:</span>
                <span className="text-mitra-gold font-mono">{dates.length} Days Configured</span>
              </div>

              {dates.map((dateStr, idx) => {
                const scheduleItem =
                  schedule.find((s) => s.date === dateStr || s.dateLabel === dateStr) || {
                    id: `day-${idx + 1}`,
                    date: dateStr,
                    dateLabel: dateStr,
                    day: '',
                    title: `Day ${idx + 1} - ${dateStr}`,
                    theme: '',
                  };

                const isEditing = editingDayIndex === idx;

                if (isEditing) {
                  return (
                    <div
                      key={`edit-${dateStr}-${idx}`}
                      className="bg-slate-900 border border-mitra-gold/60 p-3.5 rounded-xl space-y-3 animate-in fade-in"
                    >
                      <div className="text-xs font-bold text-mitra-gold flex items-center justify-between">
                        <span>Edit Day #{idx + 1}: {dateStr}</span>
                        <span className="text-[10px] text-slate-400 font-normal">Customizing Schedule Fields</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Date Label (Display)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 13 Sep (Sun)"
                            value={editItemState.dateLabel || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, dateLabel: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Day of Week
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sunday"
                            value={editItemState.day || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, day: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Raw Date Key
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 13th Sep"
                            value={editItemState.date || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, date: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Sacred Ritual / Deity / Title *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ganapathi Agamana & Sthapana"
                            value={editItemState.title || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, title: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Theme / Description Subtitle
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mandapam Preparation & Agamana"
                            value={editItemState.theme || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, theme: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Consecrated Blessing / Sankalpam Details
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Divine Welcome, Sanctum Purification & Auspicious Beginnings"
                            value={editItemState.blessing || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, blessing: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                            Status Badge / Label (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. GRAND CHATURTHI or MAHA VISARJAN"
                            value={editItemState.badge || ''}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, badge: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingDayIndex(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditScheduleItem(idx)}
                          className="px-3 py-1 text-xs font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 rounded flex items-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Day Details</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${dateStr}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-mitra-gold/50 transition-all group"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-mitra-gold font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {scheduleItem.dateLabel || scheduleItem.date || dateStr}
                          </span>
                          {scheduleItem.day && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                              {scheduleItem.day}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-mitra-gold font-semibold flex items-center gap-1.5">
                          <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{scheduleItem.title || `Day ${idx + 1}`}</span>
                        </div>
                        {scheduleItem.theme && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {scheduleItem.theme}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => startEditScheduleItem(idx)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-mitra-gold bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
                        title="Edit Sacred Ritual & Theme details"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Edit Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
