'use client';

import React, { useState } from 'react';
import { Calendar, Plus, X, ArrowRight, Trash2, CalendarRange, Edit3, CheckCircle2 } from 'lucide-react';

interface MultiDateSelectorProps {
  dates: string[];
  onChange: (dates: string[]) => void;
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

export default function MultiDateSelector({
  dates,
  onChange,
  label = 'Select Event / Darshan Dates',
  helperText = 'Select multiple dates where attendees can choose their darshan or participation days.',
}: MultiDateSelectorProps) {
  const [singleDate, setSingleDate] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [showRangeAdder, setShowRangeAdder] = useState(false);
  const [textEditMode, setTextEditMode] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');

  // Sync to raw text when switching to text edit mode
  const handleToggleTextMode = () => {
    if (!textEditMode) {
      setRawTextInput(dates.join(', '));
    } else {
      const parsed = rawTextInput
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      onChange(parsed);
    }
    setTextEditMode(!textEditMode);
  };

  const handleApplyRawText = () => {
    const parsed = rawTextInput
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(parsed);
    setTextEditMode(false);
  };

  const handleAddSingleDate = () => {
    if (!singleDate) return;
    const formatted = formatDateString(singleDate);
    if (!dates.includes(formatted)) {
      onChange([...dates, formatted]);
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
    const current = new Date(start);
    // Safety cap at 60 days
    let count = 0;
    while (current <= end && count < 60) {
      const formatted = current.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      if (!newDates.includes(formatted)) {
        newDates.push(formatted);
      }
      current.setDate(current.getDate() + 1);
      count++;
    }

    onChange(newDates);
    setRangeStart('');
    setRangeEnd('');
    setShowRangeAdder(false);
  };

  const handleRemoveDate = (indexToRemove: number) => {
    onChange(dates.filter((_, i) => i !== indexToRemove));
  };

  const handleClearAll = () => {
    if (dates.length === 0) return;
    if (confirm('Clear all selected dates?')) {
      onChange([]);
    }
  };

  const handleApplyGaneshPreset = () => {
    const ganeshDates = [
      '13 Sep 2026',
      '14 Sep 2026',
      '15 Sep 2026',
      '16 Sep 2026',
      '17 Sep 2026',
      '18 Sep 2026',
      '19 Sep 2026',
      '20 Sep 2026',
    ];
    // merge uniquely
    const merged = Array.from(new Set([...dates, ...ganeshDates]));
    onChange(merged);
  };

  return (
    <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-mitra-gold" />
            <span>{label}</span>
            <span className="text-mitra-gold font-normal">({dates.length} selected)</span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTextMode}
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-slate-400" />
            <span>{textEditMode ? 'Visual Picker' : 'Paste / Text Input'}</span>
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
        /* Visual Date Picker Mode */
        <div className="space-y-3">
          {/* Quick Add Pickers Bar */}
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
                <span>Add Date</span>
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
              <span>{showRangeAdder ? 'Close Range' : '+ Add Date Range'}</span>
            </button>

            {/* Ganesh Mahotsav 8 Days Preset Button */}
            <button
              type="button"
              onClick={handleApplyGaneshPreset}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/40 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
              title="Add 8 dates: 13 Sep to 20 Sep 2026"
            >
              ⚡ Ganesh 8-Days Preset
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
                  <span>Add All Days</span>
                </button>
              </div>
            </div>
          )}

          {/* Selected Date Chips */}
          <div className="min-h-[50px] p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
            {dates.length === 0 ? (
              <div className="text-center py-2 text-slate-500 text-xs">
                No extra dates added yet. (The main event date will be used by default).
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
