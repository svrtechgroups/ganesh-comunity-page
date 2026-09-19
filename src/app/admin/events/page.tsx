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
  Send,
  Edit3,
  Image as ImageIcon,
  Check,
  Play,
  Film,
  Upload
} from 'lucide-react';
import { isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';
import MultiDateSelector from '@/components/admin/MultiDateSelector';
import CustomFieldBuilder from '@/components/admin/CustomFieldBuilder';
import { CustomFieldDefinition } from '@/lib/types';

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
  totalAmount?: number;
  supportAmount?: number;
  paymentStatus?: string;
  customResponses?: Record<string, any>;
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
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Edit Event & Featured Media State
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editTab, setEditTab] = useState<'details' | 'media'>('details');
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Cultural Events' as EventItem['category'],
    date: '',
    time: '',
    venue: '',
    address: '',
    ticketPrice: 0,
    childTicketPrice: 0,
    status: 'Upcoming',
    description: '',
    bannerUrl: '',
    capacity: 5000,
    enableRsvp: true,
    enableSupportPayment: true,
    enablePooja: true,
    enforceCapacityLimit: false,
    adultCapacity: 0,
    childCapacity: 0,
    mapUrl: '',
    customFields: [] as CustomFieldDefinition[],
    availableDates: [] as string[],
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [eventSlots, setEventSlots] = useState<(any | null)[]>([null, null, null, null]);
  const [eventMediaItems, setEventMediaItems] = useState<any[]>([]);
  const [loadingEventMedia, setLoadingEventMedia] = useState(false);
  const [activeEventSlotPicker, setActiveEventSlotPicker] = useState<number | null>(null);
  const [eventMediaSearch, setEventMediaSearch] = useState('');

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
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
        if (isEdit) {
          setEditFormData((prev) => ({ ...prev, bannerUrl: json.url }));
        } else {
          setBannerUrl(json.url);
        }
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

  const handleUploadDirectToSlot = async (e: React.ChangeEvent<HTMLInputElement>, slotNum: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;

    setUploadingSlot(slotNum);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useCase', 'events');
      formData.append('identifier', `event-${editingEvent.id}-slot-${slotNum}`);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success || !uploadJson.url) {
        alert(uploadJson.error || 'Failed to upload media file');
        return;
      }

      const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i);

      // Now assign to slot with newMedia payload
      const assignRes = await fetch(`/api/admin/events/${editingEvent.id}/featured-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotNum,
          newMedia: {
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            url: uploadJson.url,
            coverImage: uploadJson.url,
            type: isVideo ? 'VIDEO' : 'IMAGE',
          },
        }),
      });

      const assignJson = await assignRes.json();
      if (assignJson.success) {
        setEventSlots(assignJson.data.slots);
        setEventMediaItems(assignJson.data.eventMedia);
        setActiveEventSlotPicker(null);
        setActionNotice(`Uploaded & assigned to Event Slot #${slotNum} successfully!`);
      } else {
        alert(assignJson.error || 'Failed to assign uploaded media to slot');
      }
    } catch (err: any) {
      console.error('Upload to slot error:', err);
      alert('Error uploading media to slot');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditTab('details');
    setActiveEventSlotPicker(null);
    setEventMediaSearch('');
    setEditFormData({
      title: evt.title || '',
      category: evt.category || 'Cultural Events',
      date: evt.date || '',
      time: evt.time || '',
      venue: evt.venue || '',
      address: evt.address || '',
      ticketPrice: evt.ticketPrice || 0,
      childTicketPrice: evt.childTicketPrice || 0,
      status: evt.status || 'Upcoming',
      description: evt.description || '',
      bannerUrl: evt.bannerUrl || '/assets/poster.jpg',
      capacity: evt.capacity || 5000,
      enableRsvp: evt.enableRsvp !== false,
      enableSupportPayment: evt.enableSupportPayment !== false,
      enablePooja: evt.enablePooja !== false,
      enforceCapacityLimit: Boolean(evt.enforceCapacityLimit),
      adultCapacity: evt.adultCapacity || 0,
      childCapacity: evt.childCapacity || 0,
      mapUrl: evt.mapUrl || '',
      customFields: Array.isArray(evt.customFields) ? evt.customFields : [],
      availableDates: Array.isArray(evt.availableDates)
        ? evt.availableDates
        : (typeof evt.availableDates === 'string' && evt.availableDates
            ? (evt.availableDates as string).split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean)
            : []),
    });
    fetchEventFeaturedMedia(evt.id);
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setActiveEventSlotPicker(null);
  };

  const fetchEventFeaturedMedia = async (eventId: string) => {
    setLoadingEventMedia(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/featured-media`);
      const json = await res.json();
      if (json.success && json.data) {
        setEventSlots(json.data.slots || [null, null, null, null]);
        setEventMediaItems(json.data.eventMedia || []);
      }
    } catch (err) {
      console.error('Failed to load event media:', err);
    } finally {
      setLoadingEventMedia(false);
    }
  };

  const handleUpdateEventDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent.id,
          ...editFormData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice(`Event "${editFormData.title}" updated successfully.`);
        fetchEvents();
      } else {
        alert(json.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Failed to update event:', err);
      alert('Failed to update event details.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssignEventSlot = async (slotNumber: number, mediaItemId: string | null) => {
    if (!editingEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}/featured-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotNumber,
          mediaItemId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEventSlots(json.data.slots);
        setEventMediaItems(json.data.eventMedia);
        setActiveEventSlotPicker(null);
        setActionNotice(json.message || `Event Slot ${slotNumber} updated.`);
      } else {
        alert(json.error || 'Failed to update slot');
      }
    } catch (err) {
      console.error('Failed to update event slot:', err);
      alert('Failed to update event slot');
    }
  };

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
      childTicketPrice: Number(childTicketPrice),
      enableRsvp,
      enableSupportPayment,
      enablePooja,
      enforceCapacityLimit,
      adultCapacity: Number(adultCapacity) || 0,
      childCapacity: Number(childCapacity) || 0,
      mapUrl: mapUrl ? mapUrl.trim() : undefined,
      customFields,
      availableDates,
      rsvpCount: 0,
      featured: true,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowAddForm(false);
    setAvailableDates([]);
    setAdultCapacity(0);
    setChildCapacity(0);
    setMapUrl('');
    setCustomFields([]);

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
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Adult Ticket Price (£)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Child Ticket Price (£)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={childTicketPrice}
                    onChange={(e) => setChildTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E Block, SLOUGH & LANGLEY COLLEGE"
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
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Google Map / Embed URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://maps.google.com/..."
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white placeholder:text-slate-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                  <span className="text-[10px] text-slate-500">Overall attendee limit</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Adult Limit Booking</label>
                  <input
                    type="number"
                    min="0"
                    value={adultCapacity}
                    onChange={(e) => setAdultCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                  <span className="text-[10px] text-slate-500">0 = no separate limit</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Child Limit Booking</label>
                  <input
                    type="number"
                    min="0"
                    value={childCapacity}
                    onChange={(e) => setChildCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                  <span className="text-[10px] text-slate-500">0 = no separate limit</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. /assets/poster.jpg"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-mitra-gold" />
                    <span>{uploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBanner}
                      onChange={(e) => handleUploadBanner(e, false)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <MultiDateSelector
                  dates={availableDates}
                  onChange={setAvailableDates}
                  label="Select Darshan / Event Date(s) for RSVP"
                  helperText="Pick multiple individual dates or generate a date range. Attendees will be able to select from these dates during registration."
                />
              </div>

              <div>
                <CustomFieldBuilder
                  fields={customFields}
                  onChange={setCustomFields}
                />
              </div>

              {/* Feature Toggles & Capacity Limit */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-mitra-gold uppercase tracking-wider block">
                  Action Buttons &amp; Registration Control
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={enableRsvp}
                      onChange={(e) => setEnableRsvp(e.target.checked)}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Enable "Register / RSVP Now"</span>
                      <span className="text-[10px] text-slate-400">Allow devotee event registrations</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={enableSupportPayment}
                      onChange={(e) => setEnableSupportPayment(e.target.checked)}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Enable "Event Support Payment"</span>
                      <span className="text-[10px] text-slate-400">Show donation / support payment CTA</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={enablePooja}
                      onChange={(e) => setEnablePooja(e.target.checked)}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Enable "Book Pooja"</span>
                      <span className="text-[10px] text-slate-400">Allow devotees to book poojas/rituals</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={enforceCapacityLimit}
                      onChange={(e) => setEnforceCapacityLimit(e.target.checked)}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Limit Registrations When Full</span>
                      <span className="text-[10px] text-slate-400">Stop accepting RSVPs if capacity is reached</span>
                    </div>
                  </label>
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
                          onClick={() => openEditModal(evt)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-mitra-gold border border-amber-500/40 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-mitra-gold" />
                          <span>Edit &amp; Media</span>
                        </button>

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
                        {rsvp.supportAmount ? (
                          <div className="text-[10px] text-amber-300 font-bold">
                            + £{rsvp.supportAmount} Event Support
                          </div>
                        ) : null}
                        {rsvp.totalAmount !== undefined && rsvp.totalAmount > 0 && (
                          <div className="text-[10px] font-bold text-slate-300">
                            Paid: £{rsvp.totalAmount.toFixed(2)} ({rsvp.paymentStatus || 'Completed'})
                          </div>
                        )}
                        {rsvp.customResponses && Object.keys(rsvp.customResponses).length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {Object.entries(rsvp.customResponses).map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                title={`${key}: ${String(val)}`}
                              >
                                {String(val)}
                              </span>
                            ))}
                          </div>
                        )}
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

      {/* ── EDIT EVENT & EVENT FEATURED MEDIA MODAL ── */}
      {editingEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeEditModal}
        >
          <div 
            className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-mitra-gold text-black font-mono font-black text-xs px-2.5 py-0.5 rounded-full">
                    Event Management
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {editingEvent.id}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white line-clamp-1">
                  {editingEvent.title}
                </h2>
              </div>

              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/40 px-6">
              <button
                onClick={() => setEditTab('details')}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
                  editTab === 'details'
                    ? 'border-mitra-gold text-mitra-gold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>1. Event Information</span>
              </button>

              <button
                onClick={() => setEditTab('media')}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
                  editTab === 'media'
                    ? 'border-mitra-gold text-mitra-gold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>2. Event Featured Media ({eventSlots.filter(Boolean).length}/4 Slots)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: EVENT DETAILS */}
              {editTab === 'details' && (
                <form onSubmit={handleUpdateEventDetails} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-300">Event Title</label>
                      <input
                        type="text"
                        required
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Category</label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as EventItem['category'] })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      >
                        <option value="Cultural Events">Cultural Events</option>
                        <option value="Devotional & Pooja">Devotional &amp; Pooja</option>
                        <option value="Community Welfare">Community Welfare</option>
                        <option value="Youth & Education">Youth &amp; Education</option>
                        <option value="Sports & Health">Sports &amp; Health</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Postponed">Postponed</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Date (YYYY-MM-DD)</label>
                      <input
                        type="text"
                        required
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Time &amp; Timings</label>
                      <input
                        type="text"
                        required
                        value={editFormData.time}
                        onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Venue</label>
                      <input
                        type="text"
                        required
                        value={editFormData.venue}
                        onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Full Address &amp; Postcode</label>
                      <input
                        type="text"
                        required
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-300">Venue Google Map / Embed URL</label>
                      <input
                        type="text"
                        placeholder="e.g. https://maps.google.com/..."
                        value={editFormData.mapUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, mapUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Total Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={editFormData.capacity}
                        onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Adult Limit Booking</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.adultCapacity}
                        onChange={(e) => setEditFormData({ ...editFormData, adultCapacity: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                      <span className="text-[10px] text-slate-500">0 = no separate limit</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Child Limit Booking</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.childCapacity}
                        onChange={(e) => setEditFormData({ ...editFormData, childCapacity: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                      <span className="text-[10px] text-slate-500">0 = no separate limit</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Adult Ticket Price (£, 0 for free)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.ticketPrice}
                        onChange={(e) => setEditFormData({ ...editFormData, ticketPrice: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">Child Ticket Price (£, 0 for free)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.childTicketPrice}
                        onChange={(e) => setEditFormData({ ...editFormData, childTicketPrice: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-300">Banner Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editFormData.bannerUrl}
                          onChange={(e) => setEditFormData({ ...editFormData, bannerUrl: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                        />
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-mitra-gold" />
                          <span>{uploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingBanner}
                            onChange={(e) => handleUploadBanner(e, true)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <MultiDateSelector
                        dates={editFormData.availableDates}
                        onChange={(dates) => setEditFormData({ ...editFormData, availableDates: dates })}
                        label="Select Darshan / Event Date(s) for RSVP"
                        helperText="Pick multiple individual dates or generate a date range. Attendees will be able to select from these dates during registration."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <CustomFieldBuilder
                        fields={editFormData.customFields}
                        onChange={(fields) => setEditFormData({ ...editFormData, customFields: fields })}
                      />
                    </div>

                    {/* Action Buttons & Capacity Toggles */}
                    <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-mitra-gold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Event Action Buttons &amp; Registration Controls</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={editFormData.enableRsvp}
                            onChange={(e) => setEditFormData({ ...editFormData, enableRsvp: e.target.checked })}
                            className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Enable "Register / RSVP Now"</span>
                            <span className="text-[10px] text-slate-400">Allow devotees to register for passes</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={editFormData.enableSupportPayment}
                            onChange={(e) => setEditFormData({ ...editFormData, enableSupportPayment: e.target.checked })}
                            className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Enable "Event Support Payment"</span>
                            <span className="text-[10px] text-slate-400">Display donate / event payment CTA</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={editFormData.enablePooja}
                            onChange={(e) => setEditFormData({ ...editFormData, enablePooja: e.target.checked })}
                            className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Enable "Book Pooja"</span>
                            <span className="text-[10px] text-slate-400">Allow devotees to book poojas/rituals</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:border-mitra-gold/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={editFormData.enforceCapacityLimit}
                            onChange={(e) => setEditFormData({ ...editFormData, enforceCapacityLimit: e.target.checked })}
                            className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Limit Registrations When Full</span>
                            <span className="text-[10px] text-slate-400">Stop accepting RSVPs if capacity is reached</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-300">Event Description</label>
                      <textarea
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="bg-mitra-gold hover:bg-amber-400 text-black font-black px-6 py-2.5 rounded-xl text-xs shadow flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Event Details</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: EVENT FEATURED MEDIA (4 SLOTS) */}
              {editTab === 'media' && (
                <div className="space-y-6">
                  {/* Guide Banner */}
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-mitra-gold" />
                        <span>Event Featured Media Slots (4 Slots)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Only photos uploaded for <span className="text-mitra-gold font-bold">"{editingEvent.title}"</span> can be selected.
                        These images maintain a distinct <span className="font-mono text-mitra-gold">eventDisplayOrder</span> (1 to 4) separate from the home screen.
                      </p>
                    </div>

                    <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-emerald-400 font-bold">
                      {eventSlots.filter(Boolean).length}/4 Active
                    </span>
                  </div>

                  {/* 4 Event Slots Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const slotNum = slotIdx + 1;
                      const item = eventSlots[slotIdx];
                      const isPickerOpenForThisSlot = activeEventSlotPicker === slotNum;

                      return (
                        <div
                          key={slotNum}
                          className={`bg-slate-900 rounded-2xl border p-3 flex flex-col justify-between space-y-3 transition-all ${
                            isPickerOpenForThisSlot
                              ? 'border-mitra-gold ring-2 ring-mitra-gold/30'
                              : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-black bg-slate-950 text-mitra-gold border border-mitra-gold/30 px-2 py-0.5 rounded">
                              EVENT SLOT #{slotNum}
                            </span>
                            {item && (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>

                          {item ? (() => {
                            const isVid = item.type === 'VIDEO' || isYouTubeUrl(item.url);
                            const thumb = item.coverImage || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || (isVid ? '/assets/poster.jpg' : item.url) || '/assets/poster.jpg';

                            return (
                              <div className="space-y-2">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                                  <img
                                    src={thumb}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                                    }}
                                  />
                                  <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                    {isVid && <Film className="w-2.5 h-2.5 shrink-0" />}
                                    <span>{item.category || (isVid ? 'Video' : 'Photo')}</span>
                                  </span>
                                  {isVid && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-8 h-8 rounded-full bg-[#E65C00] text-white flex items-center justify-center shadow-lg">
                                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[11px] font-bold text-white line-clamp-1" title={item.title}>
                                  {item.title}
                                </p>
                              </div>
                            );
                          })() : (
                            <div
                              onClick={() => setActiveEventSlotPicker(slotNum)}
                              className="aspect-video rounded-xl border border-dashed border-slate-700 hover:border-mitra-gold flex flex-col items-center justify-center p-2 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-colors"
                            >
                              <Plus className="w-5 h-5 text-mitra-gold mb-1" />
                              <span className="text-[10px] font-bold text-slate-300">Empty Slot</span>
                              <span className="text-[9px] text-slate-500">Tap to select photo</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {item ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setActiveEventSlotPicker(slotNum)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-1.5 rounded-lg border border-slate-700"
                                  >
                                    Gallery
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAssignEventSlot(slotNum, null)}
                                    className="p-1.5 bg-rose-950/50 text-rose-400 hover:bg-rose-900 hover:text-white rounded-lg border border-rose-800"
                                    title="Clear Slot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveEventSlotPicker(slotNum)}
                                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>From Gallery</span>
                                </button>
                              )}
                            </div>

                            <label className="cursor-pointer w-full bg-mitra-gold hover:bg-amber-400 text-black text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow">
                              <Upload className="w-3 h-3" />
                              <span>{uploadingSlot === slotNum ? 'Uploading...' : 'Upload Direct'}</span>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                disabled={uploadingSlot !== null}
                                onChange={(e) => handleUploadDirectToSlot(e, slotNum)}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Media Item Picker for Chosen Slot */}
                  {activeEventSlotPicker && (
                    <div className="bg-slate-900 border-2 border-mitra-gold/50 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-mitra-gold text-black font-black text-xs px-2.5 py-0.5 rounded-full font-mono">
                              Event Slot #{activeEventSlotPicker}
                            </span>
                            <span className="text-xs font-bold text-white">Choose a Photo or Upload Directly:</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Click any image below or upload a new photo directly to Slot #{activeEventSlotPicker} for {editingEvent.title}.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <label className="cursor-pointer bg-mitra-gold hover:bg-amber-400 text-black text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingSlot === activeEventSlotPicker ? 'Uploading...' : 'Upload Direct to Slot'}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              disabled={uploadingSlot !== null}
                              onChange={(e) => handleUploadDirectToSlot(e, activeEventSlotPicker)}
                            />
                          </label>
                          <div className="relative flex-1 sm:w-56">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="Search photos..."
                              value={eventMediaSearch}
                              onChange={(e) => setEventMediaSearch(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveEventSlotPicker(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {eventMediaItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 space-y-2">
                          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs font-bold">No photos currently tagged to this event.</p>
                          <p className="text-[10px] text-slate-500">
                            Upload photos for this event in the "Media &amp; Gallery" admin manager first.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                          {eventMediaItems
                            .filter((m) =>
                              m.title.toLowerCase().includes(eventMediaSearch.toLowerCase()) ||
                              m.category?.toLowerCase().includes(eventMediaSearch.toLowerCase())
                            )
                            .map((media) => {
                              const isSelectedInActiveSlot = media.isEventFeatured && media.eventDisplayOrder === activeEventSlotPicker;
                              const isSelectedInAnotherSlot = media.isEventFeatured && media.eventDisplayOrder !== activeEventSlotPicker;
                              const isVid = media.type === 'VIDEO' || isYouTubeUrl(media.url);
                              const thumb = media.coverImage || (isYouTubeUrl(media.url) ? getYouTubeThumbnailUrl(media.url, 'hq') : null) || (isVid ? '/assets/poster.jpg' : media.url) || '/assets/poster.jpg';

                              return (
                                <div
                                  key={media.id}
                                  onClick={() => handleAssignEventSlot(activeEventSlotPicker, media.id)}
                                  className={`bg-slate-950 border rounded-xl p-2 cursor-pointer group transition-all space-y-2 relative ${
                                    isSelectedInActiveSlot
                                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                      : 'border-slate-800 hover:border-mitra-gold'
                                  }`}
                                >
                                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                                    <img
                                      src={thumb}
                                      alt={media.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                                      }}
                                    />
                                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/80 text-white px-1 py-0.5 rounded flex items-center gap-1">
                                      {isVid && <Film className="w-2.5 h-2.5 shrink-0" />}
                                      <span>{media.category || (isVid ? 'Video' : 'Photo')}</span>
                                    </span>

                                    {isVid && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-[#E65C00] text-white flex items-center justify-center shadow-lg">
                                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                        </div>
                                      </div>
                                    )}

                                    {isSelectedInAnotherSlot && (
                                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded">
                                        Slot #{media.eventDisplayOrder}
                                      </span>
                                    )}
                                    {isSelectedInActiveSlot && (
                                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                                        Selected
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-mitra-gold">
                                    {media.title}
                                  </p>

                                  <button
                                    type="button"
                                    className={`w-full text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 ${
                                      isSelectedInActiveSlot
                                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-mitra-gold text-black hover:bg-amber-400'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{isSelectedInActiveSlot ? 'Currently Selected' : 'Choose This Photo'}</span>
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

