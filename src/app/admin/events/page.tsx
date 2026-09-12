'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventItem } from '@/lib/types';
import { 
  Plus, 
  Download, 
  Users, 
  Calendar, 
  Search, 
  Ticket, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  RefreshCw, 
  Filter,
  BarChart3,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Baby,
  UserCheck,
  Flame,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Send
} from 'lucide-react';

interface RSVPRecord {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  travellingFrom?: string | null;
  ticketsCount: number;
  adultsCount: number;
  childrenCount: number;
  selectedDates: string[];
  createdAt: string;
  isMember?: boolean;
  event?: {
    id: string;
    title: string;
    date: string;
    venue: string;
  };
}

interface DayAnalyticsItem {
  date: string;
  title: string;
  bookingsCount: number;
  totalPasses: number;
  adultsCount: number;
  childrenCount: number;
}

interface RSVPStats {
  totalRSVPs: number;
  totalPasses: number;
  totalAdults: number;
  totalChildren: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'analytics' | 'rsvps'>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [dayAnalytics, setDayAnalytics] = useState<DayAnalyticsItem[]>([]);
  const [stats, setStats] = useState<RSVPStats>({
    totalRSVPs: 0,
    totalPasses: 0,
    totalAdults: 0,
    totalChildren: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [exportingRsvps, setExportingRsvps] = useState(false);
  const [convertingAll, setConvertingAll] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Search & Filter state (applied at DB level)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Cultural Events');
  const [date, setDate] = useState('2026-09-14');
  const [time, setTime] = useState('Monday – Friday: 6:00 PM – 9:00 PM | Saturday: 11:00 AM – 3:00 PM');
  const [venue, setVenue] = useState('E Block, SLOUGH & LANGLEY COLLEGE');
  const [address, setAddress] = useState('Langley Road, SL3 8GW');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/assets/poster.jpg');
  const [capacity, setCapacity] = useState(5000);
  const [ticketPrice, setTicketPrice] = useState(0);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch events from database
  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        }
      })
      .catch(() => {});
  };

  // Fetch RSVPs, Day Analytics, and Stats from database with filters & pagination
  const fetchRsvps = useCallback(() => {
    setLoadingRsvps(true);
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(itemsPerPage));
    if (selectedEventFilter !== 'all') params.set('eventId', selectedEventFilter);
    if (selectedDateFilter !== 'all') params.set('selectedDate', selectedDateFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);

    fetch(`/api/admin/rsvps?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRsvps(data.data);
          if (data.pagination) setPagination(data.pagination);
          if (data.stats) setStats(data.stats);
          if (Array.isArray(data.dayAnalytics)) setDayAnalytics(data.dayAnalytics);
        }
      })
      .catch((err) => console.error('Failed to load RSVPs', err))
      .finally(() => setLoadingRsvps(false));
  }, [currentPage, itemsPerPage, selectedEventFilter, selectedDateFilter, debouncedSearch]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title,
      category,
      date,
      time,
      venue,
      address,
      description,
      bannerUrl,
      status: 'Upcoming',
      capacity: Number(capacity),
      ticketPrice: Number(ticketPrice),
      rsvpCount: 0,
      featured: true,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowAddForm(false);

    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      fetchEvents();
    } catch {}

    alert(`New Event "${newEvent.title}" successfully created!`);
  };

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to delete this RSVP record?')) return;

    try {
      const res = await fetch(`/api/admin/rsvps?id=${rsvpId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchRsvps();
        fetchEvents();
      } else {
        alert(data.error || 'Failed to delete RSVP');
      }
    } catch {
      alert('Error deleting RSVP');
    }
  };

  // Convert Single RSVP to Member & Send Password
  const handleConvertToMember = async (rsvpId: string, attendeeName: string) => {
    setConvertingId(rsvpId);
    setActionNotice(null);

    try {
      const res = await fetch('/api/admin/rsvps/convert-to-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpId }),
      });
      const data = await res.json();

      if (data.success) {
        setActionNotice(data.message);
        fetchRsvps();
        setTimeout(() => setActionNotice(null), 6000);
      } else {
        alert(data.error || 'Failed to convert RSVP to member.');
      }
    } catch (e) {
      console.error(e);
      alert('Error converting RSVP to member.');
    } finally {
      setConvertingId(null);
    }
  };

  // Convert All RSVPs to Members & Send Passwords (Bulk)
  const handleConvertAllToMembers = async () => {
    if (!confirm('Are you sure you want to create/update Member accounts and email one-time login passwords to all RSVP attendees?')) {
      return;
    }

    setConvertingAll(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/admin/rsvps/convert-to-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          convertAll: true,
          eventId: selectedEventFilter !== 'all' ? selectedEventFilter : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setActionNotice(data.message);
        fetchRsvps();
        setTimeout(() => setActionNotice(null), 8000);
      } else {
        alert(data.error || 'Failed to convert RSVPs to members.');
      }
    } catch (e) {
      console.error(e);
      alert('Error processing bulk conversion.');
    } finally {
      setConvertingAll(false);
    }
  };

  // Helper to click on a day in Analytics and filter attendee list
  const handleFilterByDay = (dayDate: string) => {
    setSelectedDateFilter(dayDate);
    setCurrentPage(1);
    setActiveTab('rsvps');
  };

  // Export full detailed attendee CSV directly from DB
  const exportAllRSVPsCSV = async () => {
    setExportingRsvps(true);
    try {
      const params = new URLSearchParams();
      params.set('exportAll', 'true');
      if (selectedEventFilter !== 'all') params.set('eventId', selectedEventFilter);
      if (selectedDateFilter !== 'all') params.set('selectedDate', selectedDateFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/admin/rsvps?${params.toString()}`);
      const json = await res.json();
      const exportList: RSVPRecord[] = json.success && Array.isArray(json.data) ? json.data : rsvps;

      let csvContent = 'RSVP ID,Event Title,Attendee Name,Email Address,Phone Number,Travelling From,Adults,Children,Total Passes,Selected Dates,Member Account,Registered At\n';

      exportList.forEach((r) => {
        const datesStr = (r.selectedDates || []).join(' | ').replace(/"/g, '""');
        const eventName = (r.event?.title || 'London Ganesh Mahotsav').replace(/"/g, '""');
        const originStr = (r.travellingFrom || '').replace(/"/g, '""');
        const isMem = r.isMember ? 'Yes (Member)' : 'No (Guest)';
        const createdStr = new Date(r.createdAt).toLocaleString('en-GB');

        csvContent += `"${r.id}","${eventName}","${r.attendeeName}","${r.attendeeEmail}","${r.attendeePhone}","${originStr}",${r.adultsCount || 1},${r.childrenCount || 0},${r.ticketsCount || 1},"${datesStr}","${isMem}","${createdStr}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MITRA_RSVPs_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export CSV error:', e);
      alert('Failed to export RSVPs.');
    } finally {
      setExportingRsvps(false);
    }
  };

  const exportSingleEventCSV = async (event: EventItem) => {
    try {
      const res = await fetch(`/api/admin/rsvps?eventId=${event.id}&exportAll=true`);
      const json = await res.json();
      const eventRsvps: RSVPRecord[] = json.success && Array.isArray(json.data) ? json.data : [];

      let csvContent = 'RSVP ID,Event Title,Attendee Name,Email Address,Phone Number,Travelling From,Adults,Children,Total Passes,Selected Dates,Member Account,Registered At\n';

      if (eventRsvps.length > 0) {
        eventRsvps.forEach((r) => {
          const datesStr = (r.selectedDates || []).join(' | ').replace(/"/g, '""');
          const originStr = (r.travellingFrom || '').replace(/"/g, '""');
          const isMem = r.isMember ? 'Yes (Member)' : 'No (Guest)';
          const createdStr = new Date(r.createdAt).toLocaleString('en-GB');
          csvContent += `"${r.id}","${event.title}","${r.attendeeName}","${r.attendeeEmail}","${r.attendeePhone}","${originStr}",${r.adultsCount || 1},${r.childrenCount || 0},${r.ticketsCount || 1},"${datesStr}","${isMem}","${createdStr}"\n`;
        });
      } else {
        csvContent += `"${event.id}","${event.title}","Summary Record","","","",,,${event.rsvpCount},"${event.date}","",""\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RSVP_${event.id}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to export event CSV');
    }
  };

  const startIndex = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-mitra-gold" />
            <span>Events &amp; RSVP Database Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time registration tracking, per-day attendee analytics, pass breakdown, and member login generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchEvents(); fetchRsvps(); }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-mitra-gold ${loadingRsvps ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-mitra-red hover:bg-mitra-red-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel Form' : 'Add New Event'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/50 p-4 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total RSVPs in Database</span>
          <div className="text-2xl font-black text-mitra-gold">{stats.totalRSVPs} Bookings</div>
          <span className="text-[11px] text-emerald-400 font-medium">{stats.totalPasses} Total Passes Issued</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Adults Attending</span>
          <div className="text-2xl font-black text-white">{stats.totalAdults} Adults</div>
          <span className="text-[11px] text-slate-400">Adult passes registered</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Children Attending</span>
          <div className="text-2xl font-black text-amber-400">{stats.totalChildren} Children</div>
          <span className="text-[11px] text-slate-400">Complimentary passes</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Events</span>
          <div className="text-2xl font-black text-white">{events.length} Live</div>
          <span className="text-[11px] text-slate-400">Langley &amp; London listings</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'events'
              ? 'border-mitra-gold text-mitra-gold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events List ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'analytics'
              ? 'border-mitra-gold text-mitra-gold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Per-Day RSVP Analytics ({dayAnalytics.length} Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'rsvps'
              ? 'border-mitra-gold text-mitra-gold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Attendee RSVPs &amp; Passes Ledger ({pagination.total})</span>
          {selectedDateFilter !== 'all' && (
            <span className="bg-mitra-gold text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
              {selectedDateFilter}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: EVENTS MANAGEMENT ────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Add Event Form Modal / Expandable Card */}
          {showAddForm && (
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
                    <option value="Mahotsav &amp; Darshan">Mahotsav &amp; Darshan</option>
                    <option value="Business Networking">Business Networking</option>
                    <option value="Sports">Sports</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="World Conferences">World Conferences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ticket Price (£)</label>
                  <input
                    type="number"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E Block, SLOUGH &amp; LANGLEY COLLEGE"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Langley Road, SL3 8GW"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-mitra-red hover:bg-mitra-red-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                Publish Event Immediately
              </button>
            </form>
          )}

          {/* Events List Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Event Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date &amp; Venue</th>
                  <th className="p-4">RSVPs / Capacity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((evt) => {
                  return (
                    <tr key={evt.id} className="hover:bg-slate-900/50">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{evt.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">ID: {evt.id}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-mitra-red/20 text-mitra-gold font-mono px-2 py-0.5 rounded text-[10px]">
                          {evt.category}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="text-slate-200">{evt.date}</div>
                        <div className="text-[11px] text-slate-400">{evt.venue}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-emerald-400 block">
                          {evt.rsvpCount} / {evt.capacity}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Total Registered Passes
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEventFilter(evt.id);
                            setActiveTab('analytics');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-mitra-gold border border-slate-700 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <BarChart3 className="w-3 h-3 text-mitra-gold" />
                          <span>Day Analytics</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEventFilter(evt.id);
                            setSelectedDateFilter('all');
                            setCurrentPage(1);
                            setActiveTab('rsvps');
                          }}
                          className="bg-mitra-navy hover:bg-slate-800 text-mitra-gold border border-mitra-gold/30 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          <span>View Attendees</span>
                        </button>

                        <button
                          onClick={() => exportSingleEventCSV(evt)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-mitra-gold" />
                          <span>Export CSV</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PER-DAY RSVP ANALYTICS ───────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header & Event Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-mitra-gold" />
                <span>Daily RSVP &amp; Attendee Analytics Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400">
                Shows exact registration counts, total passes, adult devotees, and children for each festival darshan day. Click on any day to filter and view the full attendee roster.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 font-semibold">Event:</span>
              <select
                value={selectedEventFilter}
                onChange={(e) => {
                  setSelectedEventFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
              >
                <option value="all">All Events</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dayAnalytics.map((day, idx) => {
              const isSelected = selectedDateFilter === day.date;
              return (
                <div
                  key={idx}
                  onClick={() => handleFilterByDay(day.date)}
                  className={`bg-slate-950 p-5 rounded-2xl border transition-all cursor-pointer space-y-4 hover:border-mitra-gold hover:shadow-lg group ${
                    isSelected ? 'border-mitra-gold ring-2 ring-mitra-gold/50 bg-slate-900/60' : 'border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-mitra-gold block">
                        {day.date}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1" title={day.title}>
                        {day.title}
                      </h3>
                    </div>
                    <span className="p-2 rounded-xl bg-slate-900 text-mitra-gold border border-slate-800 group-hover:bg-mitra-gold group-hover:text-black transition-colors">
                      <Flame className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Stats Grid for this Day */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Bookings</span>
                      <span className="text-base font-black text-mitra-gold font-mono">{day.bookingsCount}</span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Adults</span>
                      <span className="text-base font-black text-white font-mono">{day.adultsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Children</span>
                      <span className="text-base font-black text-amber-400 font-mono">{day.childrenCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {day.totalPasses} Total Passes
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterByDay(day.date);
                      }}
                      className="text-mitra-gold group-hover:text-white font-bold inline-flex items-center gap-1 text-[11px] hover:underline"
                    >
                      <span>Filter Roster</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Breakdown Summary Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Daily Capacity &amp; Registration Summary
              </h3>
              <span className="text-xs text-slate-400">
                Click any row to filter attendee database
              </span>
            </div>
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Festival Date</th>
                  <th className="p-4">Pooja / Celebration</th>
                  <th className="p-4">RSVP Bookings</th>
                  <th className="p-4">Adults</th>
                  <th className="p-4">Children</th>
                  <th className="p-4">Total Passes</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dayAnalytics.map((day, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleFilterByDay(day.date)}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-mitra-gold font-mono whitespace-nowrap">
                      {day.date}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {day.title}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {day.bookingsCount}
                    </td>
                    <td className="p-4 font-mono text-slate-200">
                      {day.adultsCount}
                    </td>
                    <td className="p-4 font-mono text-amber-400">
                      {day.childrenCount}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {day.totalPasses}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterByDay(day.date);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-mitra-gold border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: ATTENDEE RSVPS & PASSES DATABASE ─────────────────────────── */}
      {activeTab === 'rsvps' && (
        <div className="space-y-6">
          
          {/* Active Filter Notification Banner */}
          {selectedDateFilter !== 'all' && (
            <div className="bg-mitra-red/20 border border-mitra-gold/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-mitra-gold text-black rounded-lg font-bold">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-slate-300">Currently Filtering Attendees for Date: </span>
                  <strong className="text-mitra-gold font-mono text-sm">{selectedDateFilter}</strong>
                  <span className="text-slate-400 ml-2">({pagination.total} Matching Registrations in DB)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedDateFilter('all');
                  setCurrentPage(1);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-mitra-gold" />
                <span>Clear Day Filter (Show All Days)</span>
              </button>
            </div>
          )}

          {/* Controls Bar & Admin Trigger */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-1 flex-wrap gap-3 items-center">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or origin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* Event Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-mitra-gold" />
                <span className="text-slate-400 font-semibold">Event:</span>
                <select
                  value={selectedEventFilter}
                  onChange={(e) => {
                    setSelectedEventFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs"
                >
                  <option value="all">All Events</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-mitra-gold" />
                <span className="text-slate-400 font-semibold">Day:</span>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => {
                    setSelectedDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs"
                >
                  <option value="all">All Festival Days</option>
                  {dayAnalytics.map((d, i) => (
                    <option key={i} value={d.date}>
                      {d.date} ({d.bookingsCount} rsvps)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rows Per Page */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
                <span>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </div>

            </div>

            {/* Action Buttons: Bulk Convert to Members & Export CSV */}
            <div className="flex items-center gap-2.5">
              {/* Trigger: Convert All to Member Logins & Send OTP */}
              <button
                onClick={handleConvertAllToMembers}
                disabled={convertingAll || pagination.total === 0}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors whitespace-nowrap"
                title="Create/Update Member Accounts for all RSVPs & send one-time login passwords"
              >
                <KeyRound className={`w-3.5 h-3.5 ${convertingAll ? 'animate-spin' : ''}`} />
                <span>{convertingAll ? 'Sending OTPs...' : 'Convert All RSVPs to Members & Send OTP'}</span>
              </button>

              <button
                onClick={exportAllRSVPsCSV}
                disabled={exportingRsvps || pagination.total === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exportingRsvps ? 'Exporting...' : `Export CSV (${pagination.total})`}</span>
              </button>
            </div>
          </div>

          {/* Attendee RSVPs Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Attendee Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Member Status</th>
                  <th className="p-4">Selected Darshan Dates</th>
                  <th className="p-4">Pass Breakdown</th>
                  <th className="p-4">Registered At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loadingRsvps ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-mitra-gold" />
                        <span>Loading attendee registrations from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : rsvps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                      No RSVP registrations found matching the criteria in PostgreSQL.
                    </td>
                  </tr>
                ) : (
                  rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-slate-900/50">
                      
                      {/* Attendee Name & Pass ID */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{rsvp.attendeeName}</div>
                        {rsvp.travellingFrom && (
                          <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5 font-semibold">
                            <MapPin className="w-3 h-3 text-mitra-gold shrink-0" />
                            <span>From: {rsvp.travellingFrom}</span>
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-mitra-gold flex items-center gap-1 mt-0.5">
                          <Ticket className="w-3 h-3 text-mitra-gold shrink-0" />
                          <span>{rsvp.id}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-[#FF9A3C] shrink-0" />
                          <span className="font-mono text-[11px]">{rsvp.attendeeEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#FF9A3C] shrink-0" />
                          <span>{rsvp.attendeePhone || 'Not provided'}</span>
                        </div>
                      </td>

                      {/* Member Account Status */}
                      <td className="p-4">
                        {rsvp.isMember ? (
                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 whitespace-nowrap">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Member Account Linked</span>
                          </span>
                        ) : (
                          <span className="bg-amber-950/60 text-amber-400 border border-amber-500/30 font-semibold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 whitespace-nowrap">
                            <UserPlus className="w-3 h-3 text-amber-400" />
                            <span>Guest / Unconverted</span>
                          </span>
                        )}
                      </td>

                      {/* Selected Darshan Dates */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rsvp.selectedDates && rsvp.selectedDates.length > 0 ? (
                            rsvp.selectedDates.map((d, i) => {
                              const isMatched = selectedDateFilter !== 'all' && d === selectedDateFilter;
                              return (
                                <span
                                  key={i}
                                  onClick={() => handleFilterByDay(d)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                                    isMatched
                                      ? 'bg-mitra-gold text-black font-bold shadow'
                                      : 'bg-mitra-red/20 text-mitra-gold border border-mitra-gold/30 hover:bg-mitra-gold/30'
                                  }`}
                                  title="Click to filter attendees for this date"
                                >
                                  {d}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-500 text-[11px]">14 Sep (Mon)</span>
                          )}
                        </div>
                      </td>

                      {/* Pass Breakdown */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-emerald-400 font-mono text-sm">
                          {rsvp.ticketsCount || (rsvp.adultsCount + rsvp.childrenCount)} Total Pass(es)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rsvp.adultsCount || 1} Adult(s) · {rsvp.childrenCount || 0} Child(ren)
                        </div>
                      </td>

                      {/* Registered Timestamp */}
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Recent'}
                      </td>

                      {/* Actions: Send Login / Convert & Delete */}
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Send Login / OTP Trigger Button */}
                        <button
                          onClick={() => handleConvertToMember(rsvp.id, rsvp.attendeeName)}
                          disabled={convertingId === rsvp.id}
                          className="bg-slate-800 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          title="Generate & Email One-Time Password / Login Credentials"
                        >
                          <KeyRound className={`w-3 h-3 text-mitra-gold ${convertingId === rsvp.id ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">
                            {convertingId === rsvp.id ? 'Sending...' : rsvp.isMember ? 'Send New OTP' : 'Convert to Member'}
                          </span>
                        </button>

                        {/* Delete Registration */}
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          title="Delete Registration"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400">
              <div>
                Showing <strong className="text-white">{startIndex}</strong> to{' '}
                <strong className="text-white">{endIndex}</strong> of{' '}
                <strong className="text-white">{pagination.total}</strong> registrations
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous Page Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || loadingRsvps}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-mitra-gold" />
                </button>

                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (pageNum) =>
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - pagination.page) <= 1
                    )
                    .map((pageNum, idx, arr) => {
                      const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-slate-500">...</span>}
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loadingRsvps}
                            className={`min-w-[32px] h-8 px-2.5 rounded-xl font-bold transition-all text-xs ${
                              pagination.page === pageNum
                                ? 'bg-mitra-gold text-black font-black shadow'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Next Page Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages || loadingRsvps}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4 text-mitra-gold" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
