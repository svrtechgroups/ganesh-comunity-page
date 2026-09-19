'use client';

import React, { useState } from 'react';
import { CustomFieldDefinition } from '@/lib/types';
import { Plus, X, ListPlus, Trash2, HelpCircle } from 'lucide-react';

interface CustomFieldBuilderProps {
  fields: CustomFieldDefinition[];
  onChange: (fields: CustomFieldDefinition[]) => void;
}

export default function CustomFieldBuilder({ fields, onChange }: CustomFieldBuilderProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<CustomFieldDefinition['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('');

  const handleAddField = () => {
    if (!newLabel.trim()) return;

    const id = `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const options = newType === 'select'
      ? newOptionsText.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newField: CustomFieldDefinition = {
      id,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      placeholder: newPlaceholder.trim() || undefined,
      options: options && options.length > 0 ? options : undefined,
    };

    onChange([...fields, newField]);
    setNewLabel('');
    setNewType('text');
    setNewRequired(false);
    setNewPlaceholder('');
    setNewOptionsText('');
    setShowAddForm(false);
  };

  const handleRemoveField = (idToRemove: string) => {
    onChange(fields.filter((f) => f.id !== idToRemove));
  };

  const addPreset = (preset: 'diet' | 'emergency' | 'gotram' | 'tshirt') => {
    const presets: Record<string, CustomFieldDefinition> = {
      diet: {
        id: `field_diet_${Date.now()}`,
        label: 'Dietary Preference / Allergies',
        type: 'select',
        required: false,
        options: ['Vegetarian (Standard)', 'Vegan', 'Jain (No Onion/Garlic)', 'Halal / Kosher', 'Nut Allergy / Other'],
      },
      emergency: {
        id: `field_emergency_${Date.now()}`,
        label: 'Emergency Contact (Name & Phone Number)',
        type: 'text',
        required: false,
        placeholder: 'e.g. Spouse / Relative +44 7123 456789',
      },
      gotram: {
        id: `field_gotram_${Date.now()}`,
        label: 'Family Gotram / Nakshatram (For Archana Sankalpam)',
        type: 'text',
        required: false,
        placeholder: 'e.g. Kasyapa Gotram, Rohini Nakshatram',
      },
      tshirt: {
        id: `field_tshirt_${Date.now()}`,
        label: 'Participant T-Shirt / Kit Size',
        type: 'select',
        required: true,
        options: ['S (Small)', 'M (Medium)', 'L (Large)', 'XL', 'XXL', 'Kids (7-8y)', 'Kids (9-11y)'],
      },
    };

    const chosen = presets[preset];
    if (chosen && !fields.some((f) => f.label === chosen.label)) {
      onChange([...fields, chosen]);
    }
  };

  return (
    <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
            <ListPlus className="w-3.5 h-3.5 text-mitra-gold" />
            <span>Custom RSVP Form Questions ({fields.length})</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Collect special attendee information (e.g. dietary preferences, emergency contacts, Gotram, or kit sizes).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Custom Field'}</span>
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
        <span className="text-[10px] uppercase font-bold text-slate-500">Quick Presets:</span>
        <button
          type="button"
          onClick={() => addPreset('diet')}
          className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded-md transition-colors"
        >
          + Dietary Preference
        </button>
        <button
          type="button"
          onClick={() => addPreset('emergency')}
          className="text-[10px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-md transition-colors"
        >
          + Emergency Contact
        </button>
        <button
          type="button"
          onClick={() => addPreset('gotram')}
          className="text-[10px] font-semibold text-orange-300 hover:text-orange-200 bg-orange-950/40 hover:bg-orange-950/70 border border-orange-800/40 px-2 py-0.5 rounded-md transition-colors"
        >
          + Gotram / Sankalpam
        </button>
        <button
          type="button"
          onClick={() => addPreset('tshirt')}
          className="text-[10px] font-semibold text-sky-300 hover:text-sky-200 bg-sky-950/40 hover:bg-sky-950/70 border border-sky-800/40 px-2 py-0.5 rounded-md transition-colors"
        >
          + T-Shirt Size
        </button>
      </div>

      {/* Add New Field Modal / Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-mitra-gold/40 p-3.5 rounded-xl space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Field Question / Label *
              </label>
              <input
                type="text"
                placeholder="e.g. Dietary Preference, Gotram, etc."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-mitra-gold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Field Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-mitra-gold"
              >
                <option value="text">Single-line Text</option>
                <option value="textarea">Multi-line Paragraph / Notes</option>
                <option value="select">Dropdown Options (Select)</option>
                <option value="checkbox">Yes / No Checkbox</option>
                <option value="number">Number</option>
              </select>
            </div>
          </div>

          {newType === 'select' && (
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Dropdown Options (comma separated) *
              </label>
              <input
                type="text"
                placeholder="Option 1, Option 2, Option 3"
                value={newOptionsText}
                onChange={(e) => setNewOptionsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-mitra-gold"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Placeholder Hint (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Enter details..."
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-mitra-gold"
              />
            </div>

            <div className="pt-4 flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded border-slate-700 text-mitra-gold focus:ring-mitra-gold"
                />
                <span className="font-semibold">Mandatory / Required Field</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddField}
              disabled={!newLabel.trim() || (newType === 'select' && !newOptionsText.trim())}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-mitra-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Question</span>
            </button>
          </div>
        </div>
      )}

      {/* List of Configured Custom Fields */}
      {fields.length === 0 ? (
        <div className="text-center py-3 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-500 text-xs">
          No custom questions added. (Only standard Name, Email, Phone, and Dates will be asked).
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <div
              key={f.id || idx}
              className="flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-500 font-mono text-[11px]">#{idx + 1}</span>
                <span className="font-bold text-slate-200 truncate">{f.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-mono">
                  {f.type}
                </span>
                {f.required && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 font-black uppercase">
                    Required
                  </span>
                )}
                {f.options && (
                  <span className="text-[10px] text-slate-400 truncate hidden md:inline">
                    ({f.options.length} options: {f.options.slice(0, 3).join(', ')}{f.options.length > 3 ? '...' : ''})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveField(f.id)}
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-red-950/40 transition-colors shrink-0"
                title="Remove question"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
