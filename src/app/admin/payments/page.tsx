'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ArrowLeft,
  Settings,
  CheckCircle,
  RefreshCw,
  Download,
  Key,
  ShieldCheck,
  Building,
  Search,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BadgePercent,
  Calendar,
} from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  description: string;
  paymentMethod: string;
  stripePaymentIntentId?: string | null;
  memberId?: string | null;
  eventId?: string | null;
  eventName?: string | null;
  donationType?: string | null;
  poojaCategory?: string | null;
  poojaDate?: string | null;
  poojaDay?: string | null;
  poojaTitle?: string | null;
  gotram?: string | null;
  familyMembers?: string | null;
  specialWishes?: string | null;
  primaryDevoteeName?: string | null;
  createdAt: string;
}

interface PaymentStats {
  completedTotal: number;
  completedCount: number;
  pendingTotal: number;
  pendingCount: number;
  failedTotal: number;
  failedCount: number;
  totalRevenue: number;
  totalCount: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaymentSettingsData {
  stripePublishableKey: string;
  stripeSecretKey: string;
  currency: string;
  activeAccountName: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'settings'>('ledger');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    completedTotal: 0,
    completedCount: 0,
    pendingTotal: 0,
    pendingCount: 0,
    failedTotal: 0,
    failedCount: 0,
    totalRevenue: 0,
    totalCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [settings, setSettings] = useState<PaymentSettingsData>({
    stripePublishableKey: 'pk_test_mitra_default_key',
    stripeSecretKey: 'sk_test_mitra_default_key',
    currency: 'GBP',
    activeAccountName: 'MITRA Main UK Account (Stripe/Barclays)',
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state (applied at DB level)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [availableEvents, setAvailableEvents] = useState<{ id: string; title: string; date: string }[]>([]);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [cleanupResultMsg, setCleanupResultMsg] = useState<string | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPaymentsData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (eventFilter !== 'all') params.set('eventId', eventFilter);

      const [resPay, resSet] = await Promise.all([
        fetch(`/api/admin/payments?${params.toString()}`, { cache: 'no-store' }),
        fetch('/api/admin/payment-settings', { cache: 'no-store' }),
      ]);
      const dataPay = await resPay.json();
      const dataSet = await resSet.json();

      if (dataPay.success && Array.isArray(dataPay.data)) {
        setPayments(dataPay.data);
        if (dataPay.stats) setStats(dataPay.stats);
        if (dataPay.pagination) setPagination(dataPay.pagination);
        if (Array.isArray(dataPay.events)) setAvailableEvents(dataPay.events);
      }
      if (dataSet.success && dataSet.data) {
        setSettings(dataSet.data);
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, typeFilter, statusFilter, eventFilter]);

  const handleRunPendingCleanup = async () => {
    if (!confirm('Run 24h pending payments cleanup? All pending payments created more than 24 hours ago will be marked as Failed (unfinished/unprocessed).')) return;
    setRunningCleanup(true);
    setCleanupResultMsg(null);
    try {
      const res = await fetch('/api/cron/cleanup-pending-payments', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCleanupResultMsg(data.message || `Cleanup complete: ${data.updatedPaymentsCount} expired payment(s) marked as Failed.`);
        fetchPaymentsData();
      } else {
        alert(data.error || 'Failed to run cleanup.');
      }
    } catch {
      alert('Network error while running pending payments cleanup.');
    } finally {
      setRunningCleanup(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          'Stripe API Keys & Payout Account updated successfully! All future payments will route to this Stripe account.'
        );
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch {
      alert('Failed to update Stripe payment settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const exportPaymentsCSV = async () => {
    setExporting(true);
    try {
      // Fetch all matching records from DB for export
      const params = new URLSearchParams();
      params.set('exportAll', 'true');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (eventFilter !== 'all') params.set('eventId', eventFilter);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();
      const exportList: PaymentItem[] = json.success && Array.isArray(json.data) ? json.data : payments;

      const csvRows = [
        'Payment ID,Member ID,Event,Booking Type,Pooja Category,Customer Name,Primary Devotee,Email,Phone,Pooja Date,Pooja Day,Pooja Title,Gotram,Priest Sankalpam,Special Wishes,Description,Amount (£),Currency,Payment Method,Status,Date',
      ];
      exportList.forEach((p) => {
        const eventName = (p.eventName || 'London Ganesh Mahotsav 2026').replace(/"/g, '""');
        const dType = (p.donationType || 'Booking').toUpperCase();
        const pCategory = (p.poojaCategory || '').replace(/"/g, '""');
        const pDate = p.poojaDate || '';
        const pDay = p.poojaDay || '';
        const pTitle = (p.poojaTitle || '').replace(/"/g, '""');
        const pGotram = (p.gotram || '').replace(/"/g, '""');
        const pFamily = (p.familyMembers || '').replace(/"/g, '""');
        const pWishes = (p.specialWishes || '').replace(/"/g, '""');
        const pDesc = (p.description || '').replace(/"/g, '""');
        const cName = (p.customerName || '').replace(/"/g, '""');
        const devName = (p.primaryDevoteeName || cName).replace(/"/g, '""');
        const mId = p.memberId || '';

        csvRows.push(
          `"${p.id}","${mId}","${eventName}","${dType}","${pCategory}","${cName}","${devName}","${p.customerEmail}","${p.customerPhone || ''}","${pDate}","${pDay}","${pTitle}","${pGotram}","${pFamily}","${pWishes}","${pDesc}",${p.amount},"${p.currency}","${p.paymentMethod}","${p.status}","${p.createdAt}"`
        );
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MITRA_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  const startIndex = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-cinzel text-[#3D1A00]">
            STRIPE PAYMENTS &amp; ACCOUNT MANAGER
          </h1>
          <p className="text-xs text-[#6B3A2A] font-semibold">
            View real-time payment transactions, devotee Sankalpam details, and configure your active Stripe Payout Account.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-[#FFF0E0] p-1.5 rounded-2xl border border-[#E65C00]/25">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#E65C00] text-white shadow-sm border border-[#E65C00]/30'
                : 'text-[#6B3A2A] hover:text-[#E65C00]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments Ledger ({stats.totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#E65C00] text-white shadow-sm border border-[#E65C00]/30'
                : 'text-[#6B3A2A] hover:text-[#E65C00]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Stripe Account Config</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Separate Pending and Completed Totals */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Completed Revenue & Bookings */}
        <div 
          onClick={() => { setStatusFilter(statusFilter === 'Completed' ? 'all' : 'Completed'); setCurrentPage(1); }}
          className={`temple-card bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === 'Completed' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30' : 'border-emerald-500/30 hover:border-emerald-500'
          }`}
        >
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700">
              Completed Revenue
            </span>
            <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-cinzel text-emerald-700 block">
              £{stats.completedTotal.toFixed(2)}
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-700">
                {stats.completedCount} Completed
              </span>
              <span className="text-[10px] text-emerald-600/90 font-medium">
                {statusFilter === 'Completed' ? '● Filter Active' : 'Click to filter'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Revenue & Bookings */}
        <div 
          onClick={() => { setStatusFilter(statusFilter === 'Pending' ? 'all' : 'Pending'); setCurrentPage(1); }}
          className={`temple-card bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === 'Pending' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/30' : 'border-amber-500/30 hover:border-amber-500'
          }`}
        >
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700">
              Pending / In-Flight
            </span>
            <div className="p-2 bg-amber-100/80 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-cinzel text-amber-600 block">
              £{stats.pendingTotal.toFixed(2)}
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-700">
                {stats.pendingCount} Pending Bookings
              </span>
              <span className="text-[10px] text-amber-600/90 font-medium">
                {statusFilter === 'Pending' ? '● Filter Active' : 'Click to filter'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Recorded Ledger */}
        <div 
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`temple-card bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            statusFilter === 'all' ? 'border-[#E65C00]/30 ring-1 ring-[#E65C00]/20' : 'border-[#E65C00]/25'
          }`}
        >
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Recorded Ledger</span>
            <div className="p-2 bg-[#FFF0E0] rounded-xl text-[#E65C00]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-cinzel text-[#3D1A00] block">
              £{stats.totalRevenue.toFixed(2)}
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#6B3A2A]">
                {stats.totalCount} Total Transactions
              </span>
              <span className="text-[10px] text-[#E65C00] font-medium">
                All records
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Stripe Payout Account */}
        <div className="temple-card bg-white p-5 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Payout Account</span>
            <div className="p-2 bg-[#FFF0E0] rounded-xl text-[#E65C00]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-sm font-bold text-[#E65C00] truncate block" title={settings.activeAccountName}>
              {settings.activeAccountName}
            </span>
            <span className="text-[11px] text-[#6B3A2A] block font-medium">
              Currency: <strong>{settings.currency} (GBP)</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'ledger' ? (
          /* Payments Ledger Container */
          <div className="temple-card bg-white rounded-3xl border border-[#E65C00]/25 overflow-hidden space-y-6 p-6 shadow-sm">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/15 pb-4">
              <div>
                <h3 className="text-lg font-black font-cinzel text-[#3D1A00]">
                  RECENT PAYMENTS &amp; SANKALPAM LEDGER
                </h3>
                <p className="text-xs text-[#6B3A2A] font-semibold">
                  Detailed logs of devotee pooja bookings, Gotrams, priest Sankalpam family names, and seva payments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunPendingCleanup}
                  disabled={runningCleanup}
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-amber-500/30"
                  title="Check and mark pending payments older than 24 hours as failed"
                >
                  <Clock className={`w-4 h-4 ${runningCleanup ? 'animate-spin' : ''}`} />
                  <span>{runningCleanup ? 'Cleaning Up...' : 'Run 24h Pending Cleanup (Cron)'}</span>
                </button>

                <button
                  onClick={fetchPaymentsData}
                  disabled={loading}
                  className="bg-[#FFF0E0] hover:bg-[#E65C00]/10 text-[#E65C00] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-[#E65C00]/25"
                  title="Refresh Payments"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={exportPaymentsCSV}
                  disabled={exporting || pagination.total === 0}
                  className="gold-button px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>{exporting ? 'Exporting...' : `Export CSV (${pagination.total})`}</span>
                </button>
              </div>
            </div>

            {/* Cleanup Result Notification */}
            {cleanupResultMsg && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">{cleanupResultMsg}</span>
                </div>
                <button
                  onClick={() => setCleanupResultMsg(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Filter & Controls Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/20">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by devotee, Gotram, email, phone, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] placeholder:text-[#6B3A2A]/50 focus:border-[#E65C00] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Event Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span className="text-[#6B3A2A] font-semibold">Event:</span>
                  <select
                    value={eventFilter}
                    onChange={(e) => {
                      setEventFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs max-w-[200px] truncate"
                  >
                    <option value="all">All Events</option>
                    {availableEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} {ev.date ? `(${ev.date})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span className="text-[#6B3A2A] font-semibold">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs"
                  >
                    <option value="all">All Statuses ({stats.totalCount})</option>
                    <option value="Completed">Completed ({stats.completedCount})</option>
                    <option value="Pending">Pending ({stats.pendingCount})</option>
                    <option value="Failed">Failed ({stats.failedCount})</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-[#6B3A2A] font-semibold">Type:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs"
                  >
                    <option value="all">All Types</option>
                    <option value="pooja">Pooja Bookings</option>
                    <option value="anadanam">Annadanam Seva</option>
                    <option value="event donation">Event Seva</option>
                    <option value="membership">Membership</option>
                  </select>
                </div>

                {/* Rows per page */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs text-[#6B3A2A]">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs"
                  >
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Event Filter Banner */}
            {eventFilter !== 'all' && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <Calendar className="w-4 h-4 text-[#E65C00]" />
                  <span>
                    Filtered by Event: <strong>{availableEvents.find((e) => e.id === eventFilter)?.title || eventFilter}</strong> (Showing only this event's revenue and ledger)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEventFilter('all');
                    setCurrentPage(1);
                  }}
                  className="bg-white hover:bg-amber-100 text-[#E65C00] font-bold px-2.5 py-1 rounded-lg border border-[#E65C00]/30 text-[11px] transition-colors"
                >
                  Show All Events
                </button>
              </div>
            )}

            {/* Active Filters Pill Bar */}
            {(statusFilter !== 'all' || typeFilter !== 'all' || debouncedSearch) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#6B3A2A] font-semibold">Active Filters:</span>
                {statusFilter !== 'all' && (
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-emerald-300">
                    <span>Status: {statusFilter}</span>
                    <button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="bg-[#FFF0E0] text-[#E65C00] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-[#E65C00]/30">
                    <span>Type: {typeFilter}</span>
                    <button onClick={() => { setTypeFilter('all'); setCurrentPage(1); }} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-slate-300">
                    <span>Search: &ldquo;{debouncedSearch}&rdquo;</span>
                    <button onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setCurrentPage(1); }} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSearchQuery('');
                    setDebouncedSearch('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-[#E65C00] font-bold hover:underline ml-2"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-[#6B3A2A] flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E65C00]" />
                <span>Loading payment ledger records from database...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#6B3A2A]">
                  <thead className="bg-[#FFF0E0] text-[#E65C00] uppercase text-[10px] tracking-wider border-b border-[#E65C00]/25">
                    <tr>
                      <th className="p-4">Customer &amp; Devotee</th>
                      <th className="p-4">Event &amp; Type</th>
                      <th className="p-4">Sankalpam / Gotram Details</th>
                      <th className="p-4">Amount (£)</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E65C00]/10">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#6B3A2A]">
                          No transactions found matching your database filter criteria.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => {
                        const dType =
                          p.donationType ||
                          (p.description?.toLowerCase().includes('pooja')
                            ? 'pooja'
                            : p.description?.toLowerCase().includes('anadanam') ||
                              p.description?.toLowerCase().includes('annadanam')
                            ? 'anadanam'
                            : 'event seva');

                        const isCompleted = p.status?.toLowerCase() === 'completed';
                        const isPending = p.status?.toLowerCase() === 'pending';

                        return (
                          <tr key={p.id} className="hover:bg-[#FFF8F0]/60 transition-colors">
                            {/* Customer / Devotee */}
                            <td className="p-4 space-y-0.5">
                              <span className="font-bold text-[#3D1A00] block text-sm">
                                {p.customerName}
                              </span>
                              <span className="text-[11px] text-[#6B3A2A] block font-mono">
                                {p.customerEmail}
                              </span>
                              {p.customerPhone && (
                                <span className="text-[10px] text-[#6B3A2A]/80 block">
                                  {p.customerPhone}
                                </span>
                              )}
                            </td>

                            {/* Event & Booking Type */}
                            <td className="p-4 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-block bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                  {dType}
                                </span>
                                {p.poojaCategory && (
                                  <span className="inline-block bg-[#E65C00] text-white font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider shadow-sm">
                                    {p.poojaCategory}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#3D1A00] font-semibold block">
                                {p.eventName || 'London Ganesh Mahotsav 2026'}
                              </span>
                              {p.poojaDate && (
                                <span className="text-[10px] text-[#E65C00] font-bold block flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-current text-[#E65C00]" />
                                  <span>
                                    {p.poojaDate} ({p.poojaDay || ''})
                                  </span>
                                </span>
                              )}
                            </td>

                            {/* Sankalpam / Gotram / Description */}
                            <td className="p-4 space-y-0.5 max-w-xs">
                              {p.gotram && (
                                <div className="text-[11px] text-[#3D1A00]">
                                  <strong className="text-[#6B3A2A]">Gotram:</strong> {p.gotram}
                                </div>
                              )}
                              {p.familyMembers && (
                                <div className="text-[11px] text-[#3D1A00]">
                                  <strong className="text-[#6B3A2A]">Priest Sankalpam:</strong>{' '}
                                  {p.familyMembers}
                                </div>
                              )}
                              <div className="text-[10px] text-[#6B3A2A] line-clamp-2 italic">
                                {p.description}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="p-4 font-mono font-black text-[#E65C00] text-sm">
                              £{p.amount.toFixed(2)}
                            </td>

                            {/* Method */}
                            <td className="p-4">
                              <span className="bg-white text-[#6B3A2A] border border-[#E65C00]/20 px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap">
                                {p.paymentMethod}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              {isCompleted ? (
                                <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-500/25 flex items-center gap-1 max-w-fit whitespace-nowrap">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Completed</span>
                                </span>
                              ) : isPending ? (
                                <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-amber-500/30 flex items-center gap-1 max-w-fit whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending</span>
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-rose-500/30 flex items-center gap-1 max-w-fit whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>{p.status || 'Failed'}</span>
                                </span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="p-4 text-[11px] font-semibold whitespace-nowrap">
                              {new Date(p.createdAt).toLocaleDateString('en-GB')}
                            </td>

                            {/* Action Button */}
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedPaymentDetail(p)}
                                className="bg-[#FFF0E0] hover:bg-[#E65C00] text-[#E65C00] hover:text-white p-2 rounded-xl transition-all border border-[#E65C00]/30 shadow-sm inline-flex items-center gap-1 text-[11px] font-bold"
                                title="View All Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/20 text-xs text-[#6B3A2A]">
                <div>
                  Showing <strong className="text-[#3D1A00]">{startIndex}</strong> to{' '}
                  <strong className="text-[#3D1A00]">{endIndex}</strong> of{' '}
                  <strong className="text-[#3D1A00]">{pagination.total}</strong> transactions
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1 || loading}
                    className="p-2 rounded-xl bg-white border border-[#E65C00]/30 hover:bg-[#FFF0E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D1A00] transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#E65C00]" />
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
                            {showEllipsis && <span className="px-1 text-[#6B3A2A]">...</span>}
                            <button
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                              className={`min-w-[32px] h-8 px-2.5 rounded-xl font-bold transition-all text-xs ${
                                pagination.page === pageNum
                                  ? 'bg-[#E65C00] text-white font-black shadow'
                                  : 'bg-white text-[#3D1A00] hover:bg-[#FFF0E0] border border-[#E65C00]/30'
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
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="p-2 rounded-xl bg-white border border-[#E65C00]/30 hover:bg-[#FFF0E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D1A00] transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4 text-[#E65C00]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Stripe Account Settings Form */
          <div className="temple-card bg-white p-8 rounded-3xl border-2 border-[#E65C00]/30 max-w-2xl mx-auto space-y-6 shadow-md">
            <div className="border-b border-[#E65C00]/20 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#E65C00]/25 shadow-sm">
                <Key className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>DYNAMIC STRIPE PAYOUT CONFIGURATION</span>
              </div>
              <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">
                CONFIGURE STRIPE RECEIVING ACCOUNT
              </h3>
              <p className="text-xs text-[#6B3A2A] font-semibold">
                Update your Stripe API Secret Key &amp; Publishable Key below to instantly redirect all incoming bookings, seva contributions, event ticket fees, and membership payments to any Stripe Account.
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-700 text-xs p-4 rounded-2xl text-center font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Account Label / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.activeAccountName}
                  onChange={(e) => setSettings({ ...settings, activeAccountName: e.target.value })}
                  placeholder="e.g. MITRA Main Barclays Payout Account"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Publishable Key (`pk_live_...` or `pk_test_...`)
                </label>
                <input
                  type="text"
                  required
                  value={settings.stripePublishableKey}
                  onChange={(e) =>
                    setSettings({ ...settings, stripePublishableKey: e.target.value })
                  }
                  placeholder="pk_live_..."
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 font-mono text-[#3D1A00] focus:border-[#E65C00] focus:outline-none text-[11px] placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Secret Key (`sk_live_...` or `sk_test_...`)
                </label>
                <input
                  type="password"
                  required
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 font-mono text-[#3D1A00] focus:border-[#E65C00] focus:outline-none text-[11px] placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Payout Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                >
                  <option value="GBP">GBP (£) — British Pound Sterling</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                </select>
              </div>

              <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/20 text-[11px] text-[#6B3A2A] space-y-1">
                <span className="text-[#E65C00] font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#E65C00]" />
                  <span>Stripe Security Protocol:</span>
                </span>
                <p>
                  Keys are encrypted and stored in PostgreSQL schema{' '}
                  <code className="text-[#3D1A00] bg-white px-1 py-0.5 rounded border border-[#E65C00]/25">
                    mitra
                  </code>
                  . Updating these keys immediately changes the receiving endpoint for all website payment checkouts.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl"
              >
                <RefreshCw
                  className={`w-4 h-4 text-white ${savingSettings ? 'animate-spin' : ''}`}
                />
                <span>
                  {savingSettings ? 'Saving Configuration...' : 'Save & Switch Stripe Payout Account'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Detail View Modal for Full Devotee & Sankalpam Info */}
      {selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="temple-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-2xl bg-[#FFF8F0] my-8 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setSelectedPaymentDetail(null)}
              className="absolute top-5 right-5 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-[#FFF0E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-[#E65C00]/20 pb-4 space-y-1">
              <span className="inline-block bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                {selectedPaymentDetail.donationType || 'Pooja / Seva'}
              </span>
              <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">
                Payment &amp; Devotee Sankalpam
              </h3>
              <p className="text-xs text-[#6B3A2A]">
                Transaction Ref: <strong className="font-mono text-[#E65C00]">{selectedPaymentDetail.id}</strong>
              </p>
            </div>

            {/* Detailed Key-Values */}
            <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Event Name:</span>
                <span className="font-bold text-[#3D1A00] text-right">
                  {selectedPaymentDetail.eventName || 'London Ganesh Mahotsav 2026'}
                </span>
              </div>

              {selectedPaymentDetail.memberId && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Member ID:</span>
                  <span className="font-mono font-bold text-[#E65C00] text-right">
                    {selectedPaymentDetail.memberId}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Primary Devotee / Yajamani:</span>
                <span className="font-bold text-[#E65C00] text-right">
                  {selectedPaymentDetail.primaryDevoteeName || selectedPaymentDetail.customerName}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Customer Email:</span>
                <span className="font-mono text-[#3D1A00] text-right">
                  {selectedPaymentDetail.customerEmail}
                </span>
              </div>

              {selectedPaymentDetail.customerPhone && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Phone / WhatsApp:</span>
                  <span className="font-mono text-[#3D1A00] text-right">
                    {selectedPaymentDetail.customerPhone}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.poojaCategory && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Pooja / Seva Category:</span>
                  <span className="font-black text-[#E65C00] bg-[#FFF0E0] px-2.5 py-0.5 rounded-full border border-[#E65C00]/30 text-xs text-right">
                    {selectedPaymentDetail.poojaCategory}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.poojaDate && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Festival Pooja Date:</span>
                  <span className="font-bold text-[#E65C00] text-right">
                    {selectedPaymentDetail.poojaDate} ({selectedPaymentDetail.poojaDay || ''}) —{' '}
                    {selectedPaymentDetail.poojaTitle || ''}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.gotram && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Family Gotram:</span>
                  <span className="font-bold text-[#3D1A00] text-right">
                    {selectedPaymentDetail.gotram}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.familyMembers && (
                <div className="border-b border-[#E65C00]/10 pb-2 space-y-1">
                  <span className="text-[#6B3A2A] font-semibold block">Priest Sankalpam Family Names:</span>
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#3D1A00] font-medium border border-[#E65C00]/15">
                    {selectedPaymentDetail.familyMembers}
                  </div>
                </div>
              )}

              {selectedPaymentDetail.specialWishes && (
                <div className="border-b border-[#E65C00]/10 pb-2 space-y-1">
                  <span className="text-[#6B3A2A] font-semibold block">Special Prayers / Notes:</span>
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#3D1A00] italic border border-[#E65C00]/15">
                    {selectedPaymentDetail.specialWishes}
                  </div>
                </div>
              )}

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Description:</span>
                <span className="text-[#3D1A00] text-right max-w-xs truncate">
                  {selectedPaymentDetail.description}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Payment Method &amp; Status:</span>
                <span className="font-semibold text-[#3D1A00] text-right">
                  {selectedPaymentDetail.paymentMethod} ({selectedPaymentDetail.status})
                </span>
              </div>

              <div className="flex justify-between pt-1 text-sm">
                <span className="text-[#6B3A2A] font-bold">Total Amount Paid:</span>
                <span className="font-black text-[#E65C00] font-cinzel text-base">
                  £{selectedPaymentDetail.amount.toFixed(2)} {selectedPaymentDetail.currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPaymentDetail(null)}
              className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
