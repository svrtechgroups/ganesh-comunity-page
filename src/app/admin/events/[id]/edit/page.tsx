'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Save,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Users,
  Settings,
  X
} from 'lucide-react';
import MultiDateSelector from '@/components/admin/MultiDateSelector';
import CustomFieldBuilder from '@/components/admin/CustomFieldBuilder';
import { CustomFieldDefinition, EventItem, EventScheduleDay } from '@/lib/types';
import { isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');

  // Event Form Data
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cultural Events',
    date: '',
    time: '09:00 AM',
    venue: '',
    address: 'Langley, Slough, United Kingdom',
    ticketPrice: 0,
    childTicketPrice: 0,
    status: 'Upcoming',
    description: '',
    bannerUrl: '/assets/poster.jpg',
    capacity: 300,
    enableRsvp: true,
    enableSupportPayment: true,
    enablePooja: true,
    enforceCapacityLimit: false,
    adultCapacity: 0,
    childCapacity: 0,
    mapUrl: '',
    customFields: [] as CustomFieldDefinition[],
    availableDates: [] as string[],
    eventSchedule: [] as EventScheduleDay[],
  });

  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Featured Media State
  const [eventSlots, setEventSlots] = useState<(any | null)[]>([null, null, null, null]);
  const [eventMediaItems, setEventMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [activeSlotPicker, setActiveSlotPicker] = useState<number | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Fetch Event by ID
  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const evt = json.data;

        let parsedSchedule: EventScheduleDay[] = [];
        if (Array.isArray(evt.eventSchedule)) {
          parsedSchedule = evt.eventSchedule;
        } else if (typeof evt.eventSchedule === 'string' && evt.eventSchedule.trim()) {
          try {
            parsedSchedule = JSON.parse(evt.eventSchedule);
          } catch {}
        }

        let parsedDates: string[] = [];
        if (Array.isArray(evt.availableDates)) {
          parsedDates = evt.availableDates;
        } else if (typeof evt.availableDates === 'string' && evt.availableDates.trim()) {
          parsedDates = evt.availableDates.split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean);
        }

        setFormData({
          title: evt.title || '',
          category: evt.category || 'Cultural Events',
          date: evt.date || '',
          time: evt.time || '09:00 AM',
          venue: evt.venue || '',
          address: evt.address || 'Langley, Slough, United Kingdom',
          ticketPrice: evt.ticketPrice || 0,
          childTicketPrice: evt.childTicketPrice || 0,
          status: evt.status || 'Upcoming',
          description: evt.description || '',
          bannerUrl: evt.bannerUrl || '/assets/poster.jpg',
          capacity: evt.capacity || 300,
          enableRsvp: evt.enableRsvp !== false,
          enableSupportPayment: evt.enableSupportPayment !== false,
          enablePooja: evt.enablePooja !== false,
          enforceCapacityLimit: Boolean(evt.enforceCapacityLimit),
          adultCapacity: evt.adultCapacity || 0,
          childCapacity: evt.childCapacity || 0,
          mapUrl: evt.mapUrl || '',
          customFields: Array.isArray(evt.customFields) ? evt.customFields : [],
          availableDates: parsedDates,
          eventSchedule: parsedSchedule,
        });
      } else {
        alert(json.error || 'Event not found');
        router.push('/admin/events');
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      alert('Error fetching event details');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  // Fetch Event Media Slots
  const fetchFeaturedMedia = useCallback(async () => {
    if (!eventId) return;
    setLoadingMedia(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/featured-media`);
      const json = await res.json();
      if (json.success && json.data) {
        setEventSlots(json.data.slots || [null, null, null, null]);
        setEventMediaItems(json.data.eventMedia || []);
      }
    } catch (err) {
      console.error('Failed loading media slots:', err);
    } finally {
      setLoadingMedia(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchFeaturedMedia();
  }, [fetchEvent, fetchFeaturedMedia]);

  // Banner Upload
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('useCase', 'events');
      form.append('identifier', `event-banner-${eventId}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, bannerUrl: json.url }));
        setActionNotice('Banner image uploaded successfully!');
      } else {
        alert(json.error || 'Failed to upload banner');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading banner');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  // Direct Upload to Media Slot
  const handleUploadToSlot = async (e: React.ChangeEvent<HTMLInputElement>, slotNum: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slotNum);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('useCase', 'events');
      form.append('identifier', `event-${eventId}-slot-${slotNum}`);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success || !uploadJson.url) {
        alert(uploadJson.error || 'Failed to upload media file');
        return;
      }

      const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov)$/i));

      const assignRes = await fetch(`/api/admin/events/${eventId}/featured-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotNum,
          newMedia: {
            title: file.name.replace(/\.[^/.]+$/, ''),
            type: isVideo ? 'VIDEO' : 'IMAGE',
            url: uploadJson.url,
            category: 'Event Featured',
          },
        }),
      });
      const assignJson = await assignRes.json();
      if (assignJson.success) {
        setActionNotice(`Slot ${slotNum} uploaded and assigned!`);
        fetchFeaturedMedia();
      } else {
        alert(assignJson.error || 'Failed assigning slot');
      }
    } catch (err) {
      console.error('Slot upload error:', err);
      alert('Error uploading media to slot');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  // Assign existing media item to slot
  const handleAssignSlot = async (slotNum: number, mediaItemId: string | null) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/featured-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotNum,
          mediaItemId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice(mediaItemId ? `Slot ${slotNum} assigned!` : `Slot ${slotNum} cleared.`);
        fetchFeaturedMedia();
        setActiveSlotPicker(null);
      } else {
        alert(json.error || 'Failed assigning slot');
      }
    } catch (err) {
      console.error('Assign slot error:', err);
    }
  };

  // Save Event Changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Event title is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventId,
          ...formData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice('Event details & schedule updated successfully in database!');
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(json.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Save event error:', err);
      alert('Failed saving event changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-mitra-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading event details &amp; schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── BREADCRUMBS & TOP NAV BAR ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-mitra-gold" />
            <span>Back to Events Hub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <Link href="/admin/events" className="hover:text-white transition-colors">
              Events
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-mitra-gold font-bold line-clamp-1 max-w-[200px]">
              {formData.title || 'Edit Event'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-mitra-gold hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Event'}</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mitra-gold/10 text-mitra-gold border border-mitra-gold/30">
                {formData.category}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                formData.status === 'Upcoming' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {formData.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {eventId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-cinzel tracking-tight">
              {formData.title || 'Untitled Event'}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-mitra-gold" />
                <span>{formData.date || 'No Date Set'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-mitra-gold" />
                <span>{formData.time}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-mitra-gold" />
                <span>{formData.venue || 'Venue'}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/events/${eventId}`}
              target="_blank"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-mitra-gold" />
              <span>Public Page</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-t border-slate-800/80 mt-6 pt-4 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-1 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-mitra-gold text-mitra-gold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Event Details, Dates &amp; Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2 px-1 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'media'
                ? 'border-mitra-gold text-mitra-gold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Featured Media Showcase (4 Slots)</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: EVENT DETAILS, DATES & SCHEDULE ─────────────────────────── */}
      {activeTab === 'details' && (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Core Information */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Basic Info */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Calendar className="w-4 h-4 text-mitra-gold" />
                  <span>General Information</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. London Ganesh Mahotsav 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-mitra-gold font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      >
                        <option value="Cultural Events">Cultural Events</option>
                        <option value="Business Networking">Business Networking</option>
                        <option value="Sports">Sports</option>
                        <option value="Women Empowerment">Women Empowerment</option>
                        <option value="World Conferences">World Conferences</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Main Event Date</label>
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        placeholder="e.g. 13 Sep 2026 or 13-20 Sep"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Time</label>
                      <input
                        type="text"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        placeholder="09:00 AM - 09:00 PM"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Venue Name</label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="e.g. Slough Cricket Club"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Full Venue Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Upton Court Rd, Slough SL3 7LU"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed event overview, agenda, and information for devotees..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-mitra-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Unified Dates & Festival Schedule Selector */}
              <div className="space-y-2">
                <MultiDateSelector
                  dates={formData.availableDates}
                  onChange={(dates) => setFormData({ ...formData, availableDates: dates })}
                  schedule={formData.eventSchedule}
                  onScheduleChange={(schedule) => setFormData({ ...formData, eventSchedule: schedule })}
                  label="Select Darshan / Event Date(s) for RSVP & Schedule"
                  helperText="Pick multiple individual dates or generate a date range. Customize sacred rituals, deities, and themes for each day directly below."
                />
              </div>

              {/* Card 3: Custom Form Fields */}
              <div>
                <CustomFieldBuilder
                  fields={formData.customFields}
                  onChange={(fields) => setFormData({ ...formData, customFields: fields })}
                />
              </div>

            </div>

            {/* Right 1 Column: Banner, Toggles, Pricing & Capacity */}
            <div className="space-y-6">

              {/* Banner Image Card */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ImageIcon className="w-4 h-4 text-mitra-gold" />
                  <span>Event Poster / Banner</span>
                </h3>

                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.bannerUrl || '/assets/poster.jpg'}
                      alt="Banner Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.bannerUrl}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      placeholder="Image URL or upload below"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                    />
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-mitra-gold" />
                      <span>{uploadingBanner ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingBanner}
                        onChange={handleUploadBanner}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Toggles & Registration Controls */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Settings className="w-4 h-4 text-mitra-gold" />
                  <span>Registration Features</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="font-bold text-white block">Enable RSVP Bookings</span>
                      <span className="text-[11px] text-slate-400">Allow users to register and reserve passes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableRsvp}
                      onChange={(e) => setFormData({ ...formData, enableRsvp: e.target.checked })}
                      className="rounded text-mitra-gold focus:ring-mitra-gold h-4 w-4 bg-slate-950 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="font-bold text-white block">Enable Support Donations</span>
                      <span className="text-[11px] text-slate-400">Prompt users to add an optional voluntary contribution</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableSupportPayment}
                      onChange={(e) => setFormData({ ...formData, enableSupportPayment: e.target.checked })}
                      className="rounded text-mitra-gold focus:ring-mitra-gold h-4 w-4 bg-slate-950 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="font-bold text-white block">Enable Pooja Seva Bookings</span>
                      <span className="text-[11px] text-slate-400">Allow booking sacred poojas (£116 Sevas)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enablePooja}
                      onChange={(e) => setFormData({ ...formData, enablePooja: e.target.checked })}
                      className="rounded text-mitra-gold focus:ring-mitra-gold h-4 w-4 bg-slate-950 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="font-bold text-white block">Enforce Capacity Limit</span>
                      <span className="text-[11px] text-slate-400">Stop bookings when maximum capacity is reached</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enforceCapacityLimit}
                      onChange={(e) => setFormData({ ...formData, enforceCapacityLimit: e.target.checked })}
                      className="rounded text-mitra-gold focus:ring-mitra-gold h-4 w-4 bg-slate-950 border-slate-700"
                    />
                  </label>
                </div>
              </div>

              {/* Ticketing & Capacity Limits */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Users className="w-4 h-4 text-mitra-gold" />
                  <span>Capacity &amp; Pricing</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Total Capacity</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Adult Price (£)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Adult Max Limit</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.adultCapacity}
                      onChange={(e) => setFormData({ ...formData, adultCapacity: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Child Price (£)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.childTicketPrice}
                      onChange={(e) => setFormData({ ...formData, childTicketPrice: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Google Maps Embed URL</label>
                  <input
                    type="text"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-mitra-gold"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 p-4 backdrop-blur-md z-40 flex items-center justify-between max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Editing:</span>
              <strong className="text-white font-mono">{formData.title}</strong>
              <span className="text-mitra-gold font-bold">({formData.availableDates.length} Dates Configured)</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/events"
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                Discard &amp; Back
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-mitra-gold hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ── TAB 2: FEATURED MEDIA SHOWCASE (4 SLOTS) ────────────────────────── */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-mitra-gold" />
              <span>Event Featured Media Showcase (4 Hero Slots)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Assign up to 4 high-impact highlight photos or YouTube videos to feature prominently on this event&apos;s public details page.
            </p>
          </div>

          {/* 4 Hero Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((slotNum) => {
              const item = eventSlots[slotNum - 1];
              const isUploading = uploadingSlot === slotNum;

              return (
                <div
                  key={slotNum}
                  className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Slot #{slotNum}</span>
                    </span>
                    {item && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {item.type}
                      </span>
                    )}
                  </div>

                  <div className="aspect-video bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 text-mitra-gold">
                        <div className="w-6 h-6 border-2 border-mitra-gold border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px]">Uploading...</span>
                      </div>
                    ) : item ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.coverImage ||
                            (item.type === 'VIDEO' && isYouTubeUrl(item.url)
                              ? getYouTubeThumbnailUrl(item.url)
                              : item.url) ||
                            '/assets/poster.jpg'
                          }
                          alt={item.title || `Slot ${slotNum}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-1">
                        <ImageIcon className="w-8 h-8 text-slate-700 mx-auto" />
                        <span className="text-xs text-slate-500 font-semibold block">Empty Slot</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/80 flex items-center gap-2 border-t border-slate-800 mt-auto">
                    <button
                      type="button"
                      onClick={() => setActiveSlotPicker(activeSlotPicker === slotNum ? null : slotNum)}
                      className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-mitra-gold" />
                      <span>{item ? 'Change' : 'Pick Media'}</span>
                    </button>

                    <label className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors">
                      <Upload className="w-3 h-3 text-mitra-gold" />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => handleUploadToSlot(e, slotNum)}
                      />
                    </label>

                    {item && (
                      <button
                        type="button"
                        onClick={() => handleAssignSlot(slotNum, null)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-400 rounded-lg border border-red-900/40 transition-colors"
                        title="Clear Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Media Picker Drawer */}
          {activeSlotPicker !== null && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-mitra-gold/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mitra-gold" />
                  <span>Select Media for Slot #{activeSlotPicker}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSlotPicker(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Search event media items..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {eventMediaItems
                  .filter((m) => (m.title || '').toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleAssignSlot(activeSlotPicker, m.id)}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-slate-800 hover:border-mitra-gold transition-all bg-slate-900"
                    >
                      <div className="aspect-video bg-slate-950 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            m.coverImage ||
                            (m.type === 'VIDEO' && isYouTubeUrl(m.url)
                              ? getYouTubeThumbnailUrl(m.url)
                              : m.url) ||
                            '/assets/poster.jpg'
                          }
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-[11px] font-bold text-white line-clamp-1">
                        {m.title}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
