'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminGlobalEvent } from '../layout';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Heart,
  TrendingUp,
  Sparkles,
  Plus,
  RefreshCw,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Baby,
  UserCheck,
  CreditCard,
  Building,
  Filter,
  Eye,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  CalendarDays
} from 'lucide-react';

interface KPISummary {
  totalRealUsers: number;
  registeredMembersCount: number;
  activeMembersCount: number;
  subscribersCount: number;
  charityCasesCount: number;
  eventsCount: number;
  totalRevenue: number;
  completedRevenue: number;
  completedCount: number;
  pendingRevenue: number;
  pendingCount: number;
  failedRevenue: number;
  failedCount: number;
  totalPaidPoojas: number;
  totalPaidPoojaRevenue: number;
  totalFreePoojas: number;
  totalFreePasses: number;
  totalRSVPsCount: number;
  totalPassesIssued: number;
  totalAdultsCount: number;
  totalChildrenCount: number;
}

interface DailyBreakdownItem {
  id: string;
  date: string;
  dateLabel: string;
  day: string;
  title: string;
  theme: string;
  paidCount: number;
  paidRevenue: number;
  freeBookingsCount: number;
  freePasses: number;
  adultsCount: number;
  childrenCount: number;
  totalDevotees: number;
}

interface DonationBreakdownItem {
  type: string;
  count: number;
  revenue: number;
  badge: string;
}

interface TopLocation {
  name: string;
  count: number;
}

interface MemberTierItem {
  tier: string;
  count: number;
}

interface LiveFeedItem {
  id: string;
  type: 'payment' | 'rsvp' | 'member';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  amount?: string;
  details?: string;
  timestamp: string;
  rawDate: string;
}

interface DashboardData {
  success: boolean;
  source: string;
  timestamp: string;
  selectedEventId?: string;
  selectedEventTitle?: string | null;
  events?: { id: string; title: string; date: string; category?: string; enablePooja?: boolean }[];
  kpiSummary: KPISummary;
  dailyBreakdown: DailyBreakdownItem[];
  donationBreakdown: DonationBreakdownItem[];
  topLocations: TopLocation[];
  memberTiers: MemberTierItem[];
  recentPayments: any[];
  recentRSVPs: any[];
  recentMembers: any[];
  liveFeed: LiveFeedItem[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { globalEventId: selectedEventId, setGlobalEventId: setSelectedEventId } = useAdminGlobalEvent();
  const [feedFilter, setFeedFilter] = useState<'all' | 'payment' | 'rsvp' | 'member'>('all');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const url = selectedEventId && selectedEventId !== 'all'
        ? `/api/admin/dashboard-analytics?eventId=${encodeURIComponent(selectedEventId)}`
        : '/api/admin/dashboard-analytics';
      const res = await fetch(url, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastRefreshedAt(new Date().toLocaleTimeString('en-GB'));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Export Executive Summary to CSV
  const exportExecutiveSummary = () => {
    if (!data) return;
    const kpi = data.kpiSummary;

    const rows = [
      ['MITRA UK Executive CMS Analytics Report'],
      [`Generated At: ${new Date().toISOString()}`],
      [''],
      ['--- CORE EXECUTIVE METRICS ---'],
      ['Total Real Devotees / Users in DB', kpi.totalRealUsers],
      ['Total Registered Members', kpi.registeredMembersCount],
      ['Total Active Members', kpi.activeMembersCount],
      ['Total Completed Booking & Seva Revenue (£)', kpi.completedRevenue.toFixed(2)],
      ['Completed Bookings Count', kpi.completedCount],
      ['Pending Bookings / In-Flight (£)', kpi.pendingRevenue.toFixed(2)],
      ['Pending Bookings Count', kpi.pendingCount],
      [''],
      ['--- SACRED POOJAS & PASSES ---'],
      ['Paid Pooja Bookings (£116 Sevas)', kpi.totalPaidPoojas],
      ['Paid Pooja Revenue (£)', kpi.totalPaidPoojaRevenue.toFixed(2)],
      ['Free Festival RSVP Registrations', kpi.totalFreePoojas],
      ['Total Free Passes Issued', kpi.totalFreePasses],
      ['Adult Attendees Count', kpi.totalAdultsCount],
      ['Child Attendees Count', kpi.totalChildrenCount],
      [''],
      ['--- 7-DAY FESTIVAL SCHEDULE BREAKDOWN ---'],
      ['Festival Date', 'Day', 'Sacred Ritual', 'Paid Poojas (£116)', 'Paid Revenue (£)', 'Free RSVPs', 'Free Passes', 'Total Devotees'],
    ];

    data.dailyBreakdown.forEach((d) => {
      rows.push([
        d.date,
        d.day,
        `"${d.title}"`,
        d.paidCount,
        d.paidRevenue.toFixed(2),
        d.freeBookingsCount,
        d.freePasses,
        d.totalDevotees,
      ]);
    });

    const csvContent = rows.map((e) => (Array.isArray(e) ? e.join(',') : e)).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MITRA_Executive_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpi = data?.kpiSummary || {
    totalRealUsers: 0,
    registeredMembersCount: 0,
    activeMembersCount: 0,
    subscribersCount: 0,
    charityCasesCount: 0,
    eventsCount: 0,
    totalRevenue: 0,
    completedRevenue: 0,
    completedCount: 0,
    pendingRevenue: 0,
    pendingCount: 0,
    failedRevenue: 0,
    failedCount: 0,
    totalPaidPoojas: 0,
    totalPaidPoojaRevenue: 0,
    totalFreePoojas: 0,
    totalFreePasses: 0,
    totalRSVPsCount: 0,
    totalPassesIssued: 0,
    totalAdultsCount: 0,
    totalChildrenCount: 0,
  };

  // Filtered live feed items
  const filteredFeed = (data?.liveFeed || []).filter((item) => {
    if (feedFilter === 'all') return true;
    return item.type === feedFilter;
  });

  const totalPoojasCombined = (kpi.totalPaidPoojas || 0) + (kpi.totalFreePoojas || 0);
  const paidPoojaPercent = totalPoojasCombined > 0 ? Math.round((kpi.totalPaidPoojas / totalPoojasCombined) * 100) : 0;
  const freePoojaPercent = totalPoojasCombined > 0 ? 100 - paidPoojaPercent : 0;

  const currentEvent = data?.events?.find(e => e.id === selectedEventId);
  const isPoojaEnabled = selectedEventId === 'all' || currentEvent?.enablePooja !== false;

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & ACTION CONTROLS ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
          {lastRefreshedAt && (
            <span className="text-[11px] text-slate-500 font-mono">
              Updated {lastRefreshedAt}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Event Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-[#E65C00] shrink-0" />
            <span className="text-[11px] font-bold text-[#6B3A2A] hidden sm:inline">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-[#3D1A00] text-xs font-black focus:outline-none max-w-[220px] truncate cursor-pointer"
            >
              <option value="all">All Events</option>
              {(data?.events || []).map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} {ev.date ? `(${ev.date})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="bg-white hover:bg-[#FFF0E0] text-[#7A1620] hover:text-[#E65C00] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#E65C00]/25 transition-all shadow-sm hover:shadow hover:border-[#E65C00]/50 disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E65C00] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={exportExecutiveSummary}
            disabled={loading || !data}
            className="bg-white hover:bg-[#FFF0E0] text-[#E65C00] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#E65C00]/30 transition-all shadow-sm hover:shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#E65C00]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/payments"
            className="bg-[#7A1620] hover:bg-[#9C1F2E] text-[#F4C542] border border-[#F4C542]/40 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#F4C542]" />
            <span>Payments</span>
          </Link>

          <Link
            href="/admin/events"
            className="bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Events</span>
          </Link>
        </div>
      </div>

      {/* Active Event Filter Banner */}
      {selectedEventId !== 'all' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border-2 border-mitra-gold/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-mitra-gold/20 text-mitra-gold rounded-xl border border-mitra-gold/40 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block">
                Filtered View
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                {data?.selectedEventTitle || (data?.events || []).find((e) => e.id === selectedEventId)?.title || selectedEventId}
              </h3>
              <p className="text-[11px] text-slate-300">
                Displaying metrics and RSVPs for this event.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEventId('all')}
            className="self-start sm:self-auto bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm hover:shadow-md transition-all"
          >
            Show All Events
          </button>
        </div>
      )}

      {/* ── 2. CORE KPI CARDS GRID (ALL REAL DATABASE METRICS) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Real Community Devotees & Users */}
        <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-2 hover:border-[#E65C00]/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B3A2A]">
              Total Users 
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-[#3D1A00]">
              {loading ? '...' : kpi.totalRealUsers}
            </div>
            <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
              <span>{kpi.registeredMembersCount} Registered Members</span>
              <span className="text-[#8C6D62]">·</span>
              <span className="text-emerald-700">{kpi.activeMembersCount} Active</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-[10px] text-[#8C6D62]">
            <span>Community DB</span>
            <Link href="/admin/members" className="text-[#E65C00] font-bold hover:underline flex items-center gap-0.5">
              <span>View Users</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 2: Poojas */}
        {isPoojaEnabled && (
        <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-2 hover:border-[#E65C00]/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E65C00]">
              Poojas &amp; Sevas
            </span>
            <div className="p-2 bg-[#FFF0E0] text-[#E65C00] rounded-xl border border-[#E65C00]/30 shadow-xs">
              <Flame className="w-4 h-4 fill-current text-[#E65C00]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#E65C00]">
                {loading ? '...' : kpi.totalPaidPoojas}
                <span className="text-xs sm:text-sm font-bold text-[#6B3A2A] uppercase ml-1 tracking-wider">Paid</span>
              </span>
              <span className="text-lg text-[#E65C00]/40 font-normal">·</span>
              <span className="text-2xl sm:text-3xl font-black text-[#E65C00]">
                {loading ? '...' : kpi.totalFreePoojas}
                <span className="text-xs sm:text-sm font-bold text-[#6B3A2A] uppercase ml-1 tracking-wider">Free</span>
              </span>
            </div>
            <p className="text-[11px] text-[#B45309] font-bold">
              £{kpi.totalPaidPoojaRevenue.toFixed(2)} Seva Revenue
            </p>
          </div>
          <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-[10px] text-[#8C6D62]">
            <span>{kpi.totalFreePasses} Darshan Passes</span>
            <span className="text-[#E65C00] font-bold">{totalPoojasCombined} Total Bookings</span>
          </div>
        </div>
        )}

        {/* KPI 2 Alternate: Demographics (Adults vs Kids) */}
        {!isPoojaEnabled && (
        <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-2 hover:border-[#E65C00]/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              Passes Breakdown
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-200 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">
                {loading ? '...' : kpi.totalAdultsCount}
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase ml-1 tracking-wider">Adults</span>
              </span>
              <span className="text-lg text-slate-300 font-normal">·</span>
              <span className="text-2xl sm:text-3xl font-black text-purple-700">
                {loading ? '...' : kpi.totalChildrenCount}
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase ml-1 tracking-wider">Kids</span>
              </span>
            </div>
            <p className="text-[11px] text-purple-700 font-bold">
              {kpi.totalPassesIssued} Total Passes Issued
            </p>
          </div>
          <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-[10px] text-[#8C6D62]">
            <span>Attendee Demographics</span>
          </div>
        </div>
        )}

        {/* KPI 3: Total Completed Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-2 hover:border-[#E65C00]/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Completed Revenue
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shadow-xs">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-emerald-700">
              {loading ? '...' : `£${kpi.completedRevenue.toFixed(2)}`}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>{kpi.completedCount} Completed</span>
              {kpi.pendingCount > 0 && (
                <>
                  <span className="text-[#8C6D62]">·</span>
                  <span className="text-amber-700 font-bold">{kpi.pendingCount} Pending (£{kpi.pendingRevenue.toFixed(2)})</span>
                </>
              )}
            </p>
          </div>
          <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-[10px] text-[#8C6D62]">
            <span>Stripe Ledger</span>
            <Link href="/admin/payments" className="text-[#E65C00] font-bold hover:underline flex items-center gap-0.5">
              <span>Payments</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 4: Total RSVPs & Passes */}
        <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-2 hover:border-[#E65C00]/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              RSVPs &amp; Passes
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-200 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-purple-700">
              {loading ? '...' : `${kpi.totalRSVPsCount} Bookings`}
            </div>
            <p className="text-[11px] text-purple-700 font-semibold">
              {kpi.totalPassesIssued} Total Passes Issued
            </p>
          </div>
          <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-[10px] text-[#8C6D62]">
            <span>{kpi.totalAdultsCount} Adults · {kpi.totalChildrenCount} Kids</span>
            <Link href="/admin/events" className="text-[#E65C00] font-bold hover:underline flex items-center gap-0.5">
              <span>View RSVPs</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── 3. DEDICATED SECTION: PAID POOJAS VS FREE POOJAS COMPARISON ─────── */}
      {isPoojaEnabled && (
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E65C00]/25 space-y-6 shadow-sm relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E65C00]/20 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-current text-[#E65C00]" />
              <span>Seva Breakdown</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3D1A00] font-cinzel">
              Paid vs Free Poojas
            </h2>
            <p className="text-xs text-[#6B3A2A]">
              Overview of personalized sevas and general festival registrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FFF9F5] px-4 py-2.5 rounded-2xl border border-[#E65C00]/20 text-center shadow-xs">
              <span className="text-[10px] text-[#6B3A2A] block uppercase font-bold">Paid Share</span>
              <span className="text-lg font-black text-[#E65C00] font-mono">{paidPoojaPercent}%</span>
            </div>
            <div className="bg-[#FFF9F5] px-4 py-2.5 rounded-2xl border border-[#E65C00]/20 text-center shadow-xs">
              <span className="text-[10px] text-[#6B3A2A] block uppercase font-bold">Free Share</span>
              <span className="text-lg font-black text-purple-700 font-mono">{freePoojaPercent}%</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#E65C00] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-current text-[#E65C00]" />
              <span>Paid Poojas ({kpi.totalPaidPoojas} Bookings · £{kpi.totalPaidPoojaRevenue.toFixed(2)})</span>
            </span>
            <span className="text-purple-700 flex items-center gap-1.5">
              <span>Free Festival Registrations ({kpi.totalFreePoojas} Bookings · {kpi.totalFreePasses} Passes)</span>
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-full h-4 bg-[#FFF0E0] rounded-full overflow-hidden flex p-0.5 border border-[#E65C00]/20">
            <div
              style={{ width: `${Math.max(paidPoojaPercent, 5)}%` }}
              className="bg-gradient-to-r from-[#FF7A00] to-[#E65C00] rounded-l-full transition-all duration-500 shadow-sm"
              title={`Paid Poojas: ${kpi.totalPaidPoojas} bookings`}
            />
            <div
              style={{ width: `${Math.max(freePoojaPercent, 5)}%` }}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-r-full transition-all duration-500 shadow-sm"
              title={`Free Poojas: ${kpi.totalFreePoojas} registrations`}
            />
          </div>
        </div>

        {/* Auspicious Festival Day Schedule Table: ONLY visible when an event is selected */}
        {selectedEventId !== 'all' && (data?.dailyBreakdown || []).length > 0 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-mitra-gold" />
                <span>
                  {data?.selectedEventTitle || 'Event'} Schedule
                </span>
              </h3>
              <span className="text-[11px] text-mitra-gold font-mono bg-mitra-gold/10 px-2 py-0.5 rounded-full border border-mitra-gold/20">
                {data?.dailyBreakdown?.length} Days
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Ritual / Program</th>
                    <th className="p-3.5 text-center text-amber-400">Paid Sevas</th>
                    <th className="p-3.5 text-center text-amber-400">Revenue</th>
                    <th className="p-3.5 text-center text-purple-400">Free RSVPs</th>
                    <th className="p-3.5 text-center text-purple-400">Free Passes</th>
                    <th className="p-3.5 text-right text-emerald-400">Total Attendees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {(data?.dailyBreakdown || []).map((day) => (
                    <tr key={day.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-white block">{day.date}</span>
                        {day.day && <span className="text-[11px] text-slate-400 font-medium">({day.day})</span>}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-mitra-gold block">{day.title}</span>
                        {day.theme && <span className="text-[10px] text-slate-400 line-clamp-1">{day.theme}</span>}
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {day.paidCount > 0 ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2.5 py-1 rounded-full text-xs inline-block">
                            {day.paidCount} Sevas
                          </span>
                        ) : (
                          <span className="text-slate-600 font-semibold">0</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                        {day.paidRevenue > 0 ? `£${day.paidRevenue.toFixed(2)}` : '£0.00'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold text-purple-300">
                        {day.freeBookingsCount}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-purple-400">
                        {day.freePasses} passes
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                        {day.totalDevotees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      )}

      {/* ── 4. TWO COLUMN SECTION: DONATION BREAKDOWN & ATTENDEE DEMOGRAPHICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Donation Categories & Ledger Status */}
        <div className="bg-white p-6 rounded-3xl border border-[#E65C00]/20 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E65C00]/20 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[#3D1A00]">Revenue by Category</h3>
            </div>
            <Link href="/admin/payments" className="text-xs text-[#E65C00] font-bold hover:underline flex items-center gap-1">
              <span>Payments</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Revenue Status Summary Pills */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80 space-y-0.5 shadow-xs">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Completed</span>
              <span className="text-lg font-black text-emerald-700 font-mono">£{kpi.completedRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-600 block">{kpi.completedCount} Payments</span>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 space-y-0.5 shadow-xs">
              <span className="text-[10px] text-amber-800 uppercase font-bold block">Pending</span>
              <span className="text-lg font-black text-amber-700 font-mono">£{kpi.pendingRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-amber-600 block">{kpi.pendingCount} In-Flight</span>
            </div>

            <div className="bg-[#FFF9F5] p-3 rounded-2xl border border-[#E65C00]/20 space-y-0.5 shadow-xs">
              <span className="text-[10px] text-[#6B3A2A] uppercase font-bold block">Total Recorded</span>
              <span className="text-lg font-black text-[#3D1A00] font-mono">£{kpi.totalRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-[#8C6D62] block">{kpi.completedCount + kpi.pendingCount + kpi.failedCount} Txns</span>
            </div>
          </div>

          {/* Donation Classification Table */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase text-[#6B3A2A] tracking-wider block">
              Category Breakdown
            </span>
            <div className="space-y-2">
              {(data?.donationBreakdown || [])
                .filter((cat) => cat.revenue > 0 || cat.count > 0)
                .filter((cat) => isPoojaEnabled || cat.type !== 'Paid Sacred Pooja Sevas')
                .map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFF9F5] p-3 rounded-xl border border-[#E65C00]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#3D1A00] block">{cat.type}</span>
                    <span className="text-[10px] text-[#8C6D62]">{cat.count} Transactions</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    £{cat.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: RSVP Attendee Demographics & Locations */}
        <div className="bg-white p-6 rounded-3xl border border-[#E65C00]/20 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E65C00]/20 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-[#3D1A00]">Attendee Geography</h3>
            </div>
            <Link href="/admin/events" className="text-xs text-[#E65C00] font-bold hover:underline flex items-center gap-1">
              <span>View RSVPs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Attendee Passes Distribution */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200/80 space-y-1 shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-purple-800">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-[11px] uppercase font-bold">Adults</span>
              </div>
              <span className="text-2xl font-black text-purple-700 font-mono block">{kpi.totalAdultsCount}</span>
              <span className="text-[10px] text-purple-600 font-medium">Standard Passes</span>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-1 shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-amber-800">
                <Baby className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] uppercase font-bold">Children</span>
              </div>
              <span className="text-2xl font-black text-amber-700 font-mono block">{kpi.totalChildrenCount}</span>
              <span className="text-[10px] text-amber-600 font-medium">Complimentary Passes</span>
            </div>
          </div>

          {/* Top Origin Towns */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase text-[#6B3A2A] tracking-wider block">
              Top Locations
            </span>
            <div className="space-y-2">
              {(data?.topLocations || []).length === 0 ? (
                <p className="text-xs text-[#8C6D62] py-3 text-center">No origin data recorded yet.</p>
              ) : (
                data?.topLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FFF9F5] p-3 rounded-xl border border-[#E65C00]/15 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-[#6B3A2A]">
                      <MapPin className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
                      <span className="font-bold text-[#3D1A00]">{loc.name}</span>
                    </div>
                    <span className="font-mono font-bold text-purple-700">
                      {loc.count} Passes
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── 5. REAL-TIME DATABASE ACTIVITY STREAM (NO MOCK DATA) ───────────── */}
      <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white font-cinzel">
                Recent Activity
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Live updates of registrations, payments, and members.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E65C00]/20 text-xs shadow-sm">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                feedFilter === 'all'
                  ? 'bg-[#E65C00] text-white shadow-sm'
                  : 'text-[#6B3A2A] hover:text-[#E65C00] hover:bg-[#FFF0E0]'
              }`}
            >
              All ({data?.liveFeed?.length || 0})
            </button>
            <button
              onClick={() => setFeedFilter('payment')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                feedFilter === 'payment'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#6B3A2A] hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFeedFilter('rsvp')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                feedFilter === 'rsvp'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#6B3A2A] hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              RSVPs
            </button>
            <button
              onClick={() => setFeedFilter('member')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                feedFilter === 'member'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#6B3A2A] hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              Members
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-mitra-gold" />
              <span>Loading activity...</span>
            </div>
          ) : filteredFeed.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No recent records found.</p>
          ) : (
            filteredFeed.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.title}</span>
                      {item.details && (
                        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                          · {item.details}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono">
                  {item.amount && (
                    <span className={`font-black text-sm ${
                      item.amount.startsWith('£') ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {item.amount}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">{item.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
