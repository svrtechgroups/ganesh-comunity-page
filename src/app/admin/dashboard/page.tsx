'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [feedFilter, setFeedFilter] = useState<'all' | 'payment' | 'rsvp' | 'member'>('all');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/dashboard-analytics', {
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
  }, []);

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

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & ACTION CONTROLS ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Real-Time DB Sync
            </span>
            {lastRefreshedAt && (
              <span className="text-[11px] text-slate-500 font-mono">
                Updated {lastRefreshedAt}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-cinzel">
            EXECUTIVE CMS &amp; CONVERSIONS ANALYTICS
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Live database intelligence tracking RSVP passes, Sacred Pooja Sevas, Stripe bookings, and devotee registrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-mitra-gold ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing DB...' : 'Refresh'}</span>
          </button>

          <button
            onClick={exportExecutiveSummary}
            disabled={loading || !data}
            className="bg-slate-800 hover:bg-slate-700 text-mitra-gold font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-mitra-gold/30 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-mitra-gold" />
            <span>Export Summary CSV</span>
          </button>

          <Link
            href="/admin/payments"
            className="bg-[#7A1620] hover:bg-[#9C1F2E] text-[#F4C542] border border-[#D4AF37]/50 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#F4C542]" />
            <span>Payments Ledger</span>
          </Link>

          <Link
            href="/admin/events"
            className="bg-mitra-red hover:bg-mitra-red-dark text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* ── 2. CORE KPI CARDS GRID (ALL REAL DATABASE METRICS) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Real Community Devotees & Users */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-mitra-gold/50 transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Real Users &amp; Devotees
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-black transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-white font-cinzel">
              {loading ? '...' : kpi.totalRealUsers}
            </div>
            <p className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
              <span>{kpi.registeredMembersCount} Registered Members</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400">{kpi.activeMembersCount} Active</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Deduplicated across DB</span>
            <Link href="/admin/members" className="text-mitra-gold hover:underline flex items-center gap-0.5">
              <span>View Roster</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 2: Sacred Poojas (Paid vs Free Summary) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-2 hover:border-amber-400 transition-all shadow-md group bg-gradient-to-b from-amber-950/10 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Sacred Poojas &amp; Sevas
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-400 group-hover:text-black transition-colors">
              <Flame className="w-4 h-4 fill-current text-amber-400 group-hover:text-black" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-amber-400 font-cinzel">
              {loading ? '...' : `${kpi.totalPaidPoojas} Paid · ${kpi.totalFreePoojas} Free`}
            </div>
            <p className="text-[11px] text-amber-300/90 font-semibold">
              £{kpi.totalPaidPoojaRevenue.toFixed(2)} Paid Seva Revenue
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>{kpi.totalFreePasses} Devotee Darshan Passes</span>
            <span className="text-amber-400 font-bold">{totalPoojasCombined} Total Sevas</span>
          </div>
        </div>

        {/* KPI 3: Total Completed Donations Revenue */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-2 hover:border-emerald-400 transition-all shadow-md group bg-gradient-to-b from-emerald-950/10 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Completed Seva &amp; Booking Revenue
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-emerald-400 font-cinzel">
              {loading ? '...' : `£${kpi.completedRevenue.toFixed(2)}`}
            </div>
            <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
              <span>{kpi.completedCount} Completed</span>
              {kpi.pendingCount > 0 && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-400">{kpi.pendingCount} Pending (£{kpi.pendingRevenue.toFixed(2)})</span>
                </>
              )}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Stripe PCI-DSS Ledger</span>
            <Link href="/admin/payments" className="text-mitra-gold hover:underline flex items-center gap-0.5">
              <span>Manage Ledger</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 4: Total RSVPs & Passes Issued */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/30 space-y-2 hover:border-purple-400 transition-all shadow-md group bg-gradient-to-b from-purple-950/10 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              RSVP Bookings &amp; Passes
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30 group-hover:bg-purple-400 group-hover:text-black transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-black text-purple-300 font-cinzel">
              {loading ? '...' : `${kpi.totalRSVPsCount} Bookings`}
            </div>
            <p className="text-[11px] text-purple-300 font-semibold">
              {kpi.totalPassesIssued} Total Passes Issued
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>{kpi.totalAdultsCount} Adults · {kpi.totalChildrenCount} Kids</span>
            <Link href="/admin/events" className="text-mitra-gold hover:underline flex items-center gap-0.5">
              <span>View Roster</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── 3. DEDICATED SECTION: PAID POOJAS VS FREE POOJAS COMPARISON ─────── */}
      <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border-2 border-amber-500/40 space-y-6 shadow-xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Sacred Seva Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel">
              PAID POOJAS (£116 SEVA) VS FREE FESTIVAL POOJAS
            </h2>
            <p className="text-xs text-slate-400">
              Comparative breakdown between individual personalized Sankalpam Sevas (£116) and Free Community Festival Registrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Paid Pooja Seva Share</span>
              <span className="text-lg font-black text-amber-400 font-mono">{paidPoojaPercent}%</span>
            </div>
            <div className="bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Free Darshan Share</span>
              <span className="text-lg font-black text-purple-400 font-mono">{freePoojaPercent}%</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Paid Poojas ({kpi.totalPaidPoojas} Bookings · £{kpi.totalPaidPoojaRevenue.toFixed(2)})</span>
            </span>
            <span className="text-purple-400 flex items-center gap-1.5">
              <span>Free Festival Registrations ({kpi.totalFreePoojas} Bookings · {kpi.totalFreePasses} Passes)</span>
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div
              style={{ width: `${Math.max(paidPoojaPercent, 5)}%` }}
              className="bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-full transition-all duration-500 shadow-sm"
              title={`Paid Poojas: ${kpi.totalPaidPoojas} bookings`}
            />
            <div
              style={{ width: `${Math.max(freePoojaPercent, 5)}%` }}
              className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-r-full transition-all duration-500 shadow-sm"
              title={`Free Poojas: ${kpi.totalFreePoojas} registrations`}
            />
          </div>
        </div>

        {/* 7-Day Auspicious Festival Day Schedule Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-mitra-gold" />
              <span>7-Day Auspicious Festival Daily Schedule &amp; Bookings Matrix</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              London Ganesh Mahotsav 2026
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3.5">Festival Date &amp; Day</th>
                  <th className="p-3.5">Sacred Deity &amp; Ritual</th>
                  <th className="p-3.5 text-center text-amber-400">Paid Pooja Sevas (£116)</th>
                  <th className="p-3.5 text-center text-amber-400">Paid Seva Revenue</th>
                  <th className="p-3.5 text-center text-purple-400">Free RSVP Bookings</th>
                  <th className="p-3.5 text-center text-purple-400">Free Passes Issued</th>
                  <th className="p-3.5 text-right text-emerald-400">Total Day Footfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {(data?.dailyBreakdown || []).map((day) => (
                  <tr key={day.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-white block">{day.date}</span>
                      <span className="text-[11px] text-slate-400 font-medium">({day.day})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-mitra-gold block">{day.title}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{day.theme}</span>
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
                      {day.totalDevotees} Devotees
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── 4. TWO COLUMN SECTION: DONATION BREAKDOWN & ATTENDEE DEMOGRAPHICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Donation Categories & Ledger Status */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Bookings &amp; Revenue Breakdown</h3>
            </div>
            <Link href="/admin/payments" className="text-xs text-mitra-gold hover:underline flex items-center gap-1">
              <span>Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Revenue Status Summary Pills */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 space-y-0.5">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Completed</span>
              <span className="text-lg font-black text-emerald-300 font-mono">£{kpi.completedRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block">{kpi.completedCount} Payments</span>
            </div>

            <div className="bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30 space-y-0.5">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending</span>
              <span className="text-lg font-black text-amber-300 font-mono">£{kpi.pendingRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block">{kpi.pendingCount} In-Flight</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Recorded</span>
              <span className="text-lg font-black text-white font-mono">£{kpi.totalRevenue.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block">{kpi.completedCount + kpi.pendingCount + kpi.failedCount} Txns</span>
            </div>
          </div>

          {/* Donation Classification Table */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
              Completed Bookings &amp; Sevas by Category
            </span>
            <div className="space-y-2">
              {(data?.donationBreakdown || []).map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{cat.type}</span>
                    <span className="text-[10px] text-slate-400">{cat.count} Completed Transactions</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    £{cat.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: RSVP Attendee Demographics & Locations */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Attendee Demographics &amp; Geography</h3>
            </div>
            <Link href="/admin/events" className="text-xs text-mitra-gold hover:underline flex items-center gap-1">
              <span>View Attendees</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Attendee Passes Distribution */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] uppercase font-bold">Adult Devotees</span>
              </div>
              <span className="text-2xl font-black text-white font-mono block">{kpi.totalAdultsCount}</span>
              <span className="text-[10px] text-purple-300 font-medium">Standard Adult Passes</span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-300">
                <Baby className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] uppercase font-bold">Children (Under 12)</span>
              </div>
              <span className="text-2xl font-black text-amber-400 font-mono block">{kpi.totalChildrenCount}</span>
              <span className="text-[10px] text-amber-300 font-medium">Complimentary Passes</span>
            </div>
          </div>

          {/* Top Origin Towns */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
              Top Devotee Origin Cities / Towns (from DB)
            </span>
            <div className="space-y-2">
              {(data?.topLocations || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No origin data recorded yet.</p>
              ) : (
                data?.topLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-mitra-gold shrink-0" />
                      <span className="font-bold text-white">{loc.name}</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300">
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
                LIVE DATABASE ACTIVITY STREAM
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Real-time chronologically sorted transactions, festival RSVPs, and member registrations directly from Postgres.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                feedFilter === 'all' ? 'bg-mitra-gold text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events ({data?.liveFeed?.length || 0})
            </button>
            <button
              onClick={() => setFeedFilter('payment')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                feedFilter === 'payment' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Payments &amp; Poojas
            </button>
            <button
              onClick={() => setFeedFilter('rsvp')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                feedFilter === 'rsvp' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              RSVPs &amp; Passes
            </button>
            <button
              onClick={() => setFeedFilter('member')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                feedFilter === 'member' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
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
              <span>Fetching live events stream from database...</span>
            </div>
          ) : filteredFeed.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No recent records matching this filter in the database.</p>
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
