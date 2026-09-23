'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CalendarDays, Sparkles, Edit2, Check, X } from 'lucide-react';
import { EventScheduleDay } from '@/lib/types';
import { DEFAULT_GANESH_SCHEDULE } from '@/lib/event-schedule';

interface EventScheduleBuilderProps {
  schedule: EventScheduleDay[];
  onChange: (schedule: EventScheduleDay[]) => void;
  onSyncDates?: (dates: string[]) => void;
}

export default function EventScheduleBuilder({
  schedule = [],
  onChange,
  onSyncDates,
}: EventScheduleBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Partial<EventScheduleDay>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<EventScheduleDay>>({
    date: '',
    dateLabel: '',
    day: '',
    title: '',
    theme: '',
  });

  const syncAvailableDates = (updated: EventScheduleDay[]) => {
    onChange(updated);
    if (onSyncDates) {
      const dates = updated.map((d) => d.dateLabel || d.date).filter(Boolean);
      onSyncDates(dates);
    }
  };

  const handleLoadGaneshPreset = () => {
    syncAvailableDates(DEFAULT_GANESH_SCHEDULE);
  };

  const handleAddDay = () => {
    if (!newItem.title || !newItem.date) {
      alert('Please provide at least a Date and a Title / Ritual for the day.');
      return;
    }

    const id = `day-${Date.now()}`;
    const dateLabel = newItem.dateLabel || newItem.date;
    const dayItem: EventScheduleDay = {
      id,
      date: newItem.date,
      dateLabel,
      day: newItem.day || '',
      title: newItem.title,
      theme: newItem.theme || '',
    };

    const updated = [...schedule, dayItem];
    syncAvailableDates(updated);
    setNewItem({ date: '', dateLabel: '', day: '', title: '', theme: '' });
    setShowAddForm(false);
  };

  const handleRemoveDay = (index: number) => {
    const updated = schedule.filter((_, i) => i !== index);
    syncAvailableDates(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditItem({ ...schedule[index] });
  };

  const saveEdit = (index: number) => {
    if (!editItem.title || !editItem.date) {
      alert('Date and Title are required.');
      return;
    }
    const updated = [...schedule];
    updated[index] = {
      ...updated[index],
      ...editItem,
      dateLabel: editItem.dateLabel || editItem.date || updated[index].date,
    } as EventScheduleDay;
    syncAvailableDates(updated);
    setEditingIndex(null);
  };

  return (
    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <label className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-mitra-gold" />
            <span>Event Daily Schedule &amp; Festival Dates</span>
            <span className="text-mitra-gold font-normal">({schedule.length} Days Configured)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure rich per-day schedule dates (Deity, Ritual, Theme) for this single event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadGaneshPreset}
            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Load 8-Day Ganesh Mahotsav Schedule (13 Sep - 20 Sep)"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Load 8-Day Ganesh Preset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Day'}</span>
          </button>
        </div>
      </div>

      {/* Add New Day Form */}
      {showAddForm && (
        <div className="bg-slate-900/90 border border-mitra-gold/40 p-3.5 rounded-xl space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-mitra-gold uppercase tracking-wider">
            + Add New Schedule Day
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Date (e.g. 13th Sep or 13 Sep 2026) *
              </label>
              <input
                type="text"
                placeholder="13th Sep"
                value={newItem.date || ''}
                onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Date Label (e.g. 13 Sep (Sun))
              </label>
              <input
                type="text"
                placeholder="13 Sep (Sun)"
                value={newItem.dateLabel || ''}
                onChange={(e) => setNewItem({ ...newItem, dateLabel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Day of Week (e.g. Sunday)
              </label>
              <input
                type="text"
                placeholder="Sunday"
                value={newItem.day || ''}
                onChange={(e) => setNewItem({ ...newItem, day: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Sacred Ritual / Deity / Title *
              </label>
              <input
                type="text"
                placeholder="Ganapathi Agamana & Sthapana"
                value={newItem.title || ''}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Theme / Description
              </label>
              <input
                type="text"
                placeholder="Mandapam Preparation & Agamana"
                value={newItem.theme || ''}
                onChange={(e) => setNewItem({ ...newItem, theme: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDay}
              className="px-4 py-1 text-xs font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 rounded-lg shadow"
            >
              Save Day
            </button>
          </div>
        </div>
      )}

      {/* Schedule Items List */}
      {schedule.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Calendar className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No schedule days configured yet for this event.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click &ldquo;Add Day&rdquo; or &ldquo;Load 8-Day Ganesh Preset&rdquo; above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedule.map((day, idx) => {
            const isEditing = editingIndex === idx;

            if (isEditing) {
              return (
                <div
                  key={day.id || idx}
                  className="bg-slate-900 border border-mitra-gold/50 p-3 rounded-xl space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Date (e.g. 13th Sep)"
                      value={editItem.date || ''}
                      onChange={(e) => setEditItem({ ...editItem, date: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g. 13 Sep (Sun))"
                      value={editItem.dateLabel || ''}
                      onChange={(e) => setEditItem({ ...editItem, dateLabel: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Day (e.g. Sunday)"
                      value={editItem.day || ''}
                      onChange={(e) => setEditItem({ ...editItem, day: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Ritual / Title"
                      value={editItem.title || ''}
                      onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Theme / Description"
                      value={editItem.theme || ''}
                      onChange={(e) => setEditItem({ ...editItem, theme: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="p-1 text-xs text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(idx)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-950 bg-mitra-gold rounded flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={day.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-mitra-gold font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {day.dateLabel || day.date}
                      </span>
                      {day.day && (
                        <span className="text-[10px] text-slate-400">({day.day})</span>
                      )}
                    </div>
                    <div className="text-xs text-mitra-gold font-medium">{day.title}</div>
                    {day.theme && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">{day.theme}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(idx)}
                    className="p-1.5 text-slate-400 hover:text-mitra-gold hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Day"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
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
  );
}
