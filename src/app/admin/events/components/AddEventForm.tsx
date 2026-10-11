'use client';

import React, { useState } from 'react';
import { Upload, Plus, X, Trash2 } from 'lucide-react';
import { EventItem, CustomFieldDefinition, EventScheduleDay } from '@/lib/types';

interface AddEventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  setActionNotice: (msg: string) => void;
}

export function AddEventForm({ onSuccess, onCancel, setActionNotice }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Cultural Events');
  const [date, setDate] = useState('2026-09-14');
  const [time, setTime] = useState('Monday – Saturday: 6:00 PM – 9:00 PM | Sunday: 11:00 AM – 5:00 PM');
  const [venue, setVenue] = useState('E Block, SLOUGH & LANGLEY COLLEGE');
  const [address, setAddress] = useState('Langley Road, SL3 8GW');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/assets/poster.jpg');
  const [capacity, setCapacity] = useState(5000);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [childTicketPrice, setChildTicketPrice] = useState(0);
  const [enableRsvp, setEnableRsvp] = useState(true);
  const [enableSupportPayment, setEnableSupportPayment] = useState(true);
  const [enablePooja, setEnablePooja] = useState(true);
  const [enforceCapacityLimit, setEnforceCapacityLimit] = useState(false);
  const [adultCapacity, setAdultCapacity] = useState(0);
  const [childCapacity, setChildCapacity] = useState(0);
  const [mapUrl, setMapUrl] = useState('');
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [eventSchedule, setEventSchedule] = useState<EventScheduleDay[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useCase', 'events');
      formData.append('identifier', 'event-banner');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setBannerUrl(json.url);
        setActionNotice('Banner image uploaded successfully!');
      } else {
        alert(json.error || 'Failed to upload banner image');
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      alert('Failed to upload banner image');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: '', label: '', type: 'text', required: false },
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    setCustomFields(newFields);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      alert('Title and date are required.');
      return;
    }

    try {
      const payload: Partial<EventItem> = {
        title,
        category,
        date,
        time,
        venue,
        address,
        description,
        bannerUrl,
        capacity,
        ticketPrice,
        childTicketPrice,
        status: 'Upcoming',
        enableRsvp,
        enableSupportPayment,
        enablePooja,
        enforceCapacityLimit,
        adultCapacity,
        childCapacity,
        mapUrl,
        customFields: customFields.length > 0 ? (customFields as any) : undefined,
        availableDates: availableDates.length > 0 ? (availableDates as any) : undefined,
        eventSchedule: eventSchedule.length > 0 ? (eventSchedule as any) : undefined,
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setActionNotice('Event created successfully!');
        onSuccess();
      } else {
        alert(json.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Create event error:', err);
      alert('An unexpected error occurred while creating the event.');
    }
  };

  return (
    <form onSubmit={handleCreateEvent} className="bg-slate-950 p-6 rounded-3xl border-2 border-mitra-gold space-y-4 text-xs">
      <h2 className="text-base font-bold text-mitra-gold">Create New MITRA Event</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Event Title</label>
          <input
            type="text"
            required
            placeholder="e.g. London Ganesh Mahotsav 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          >
            <option value="Cultural Events">Cultural Events</option>
            <option value="Mahotsav & Darshan">Mahotsav & Darshan</option>
            <option value="Business Networking">Business Networking</option>
            <option value="Sports">Sports</option>
            <option value="Women Empowerment">Women Empowerment</option>
            <option value="World Conferences">World Conferences</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Event Date</label>
          <input
            type="text"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Timing Details</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Venue Name</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Full Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event details..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Banner Settings</label>
          <div className="space-y-2">
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="Banner Image URL"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
            />
            <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-3 rounded-lg border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingBanner ? 'Uploading...' : 'Upload New Banner'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingBanner}
                onChange={(e) => handleUploadBanner(e)}
              />
            </label>
            {bannerUrl && (
              <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-slate-800 relative group">
                <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-white mb-3 text-sm">Tickets & Capacity Limits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Total Venue Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Adult Ticket Price (£)</label>
            <input
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Child Ticket Price (£)</label>
            <input
              type="number"
              value={childTicketPrice}
              onChange={(e) => setChildTicketPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enforceCapacityLimit}
              onChange={(e) => setEnforceCapacityLimit(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enforce strict limits?</span>
          </label>
          {enforceCapacityLimit && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Adult Max:</span>
                <input
                  type="number"
                  value={adultCapacity}
                  onChange={(e) => setAdultCapacity(parseInt(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-800 rounded p-1 text-center"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Child Max:</span>
                <input
                  type="number"
                  value={childCapacity}
                  onChange={(e) => setChildCapacity(parseInt(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-800 rounded p-1 text-center"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRsvp}
              onChange={(e) => setEnableRsvp(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable RSVPs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableSupportPayment}
              onChange={(e) => setEnableSupportPayment(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable Donations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enablePooja}
              onChange={(e) => setEnablePooja(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable Pooja Bookings</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Custom Form Fields</h3>
          <button
            type="button"
            onClick={addCustomField}
            className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded"
          >
            <Plus className="w-3 h-3" /> Add Field
          </button>
        </div>
        {customFields.length === 0 ? (
          <p className="text-slate-500 italic">No custom fields defined.</p>
        ) : (
          <div className="space-y-2">
            {customFields.map((field, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex-1">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Field ID (camelCase)</label>
                  <input
                    type="text"
                    value={field.id}
                    onChange={(e) => updateCustomField(idx, { id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                    placeholder="e.g. dietaryReqs"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Label (Display)</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                    placeholder="e.g. Dietary Requirements"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(idx, { type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-20 pb-1.5">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateCustomField(idx, { required: e.target.checked })}
                  />
                  <span className="text-slate-400 text-[10px]">Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  className="text-red-400 hover:bg-red-400/20 p-1.5 rounded mb-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white font-bold px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-mitra-gold hover:bg-amber-400 text-black font-black px-6 py-2 rounded-xl transition-colors"
        >
          Create Event
        </button>
      </div>
    </form>
  );
}
