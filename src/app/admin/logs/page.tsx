'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldCheck,
  Zap,
  Info,
  Terminal,
  Gauge,
  Timer,
  Globe,
  Server,
  BarChart3,
} from 'lucide-react';

interface SystemLog {
  id: string;
  level: string;
  source: string;
  message: string;
  details: any;
  ip: string | null;
  userId: string | null;
  createdAt: string;
}

interface AnalyticsStats {
  totalHttpRequests: number;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  statusCounts: Record<string, number>;
  slowestRoutes: Array<{ route: string; count: number; avgMs: number }>;
}

interface Stats {
  total: number;
  countsByLevel: Record<string, number>;
  retentionDays: number;
  retentionCutoff: string;
  analytics?: AnalyticsStats;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    countsByLevel: {},
    retentionDays: 7,
    retentionCutoff: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [pruning, setPruning] = useState(false);
  const [pruneResult, setPruneResult] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        level: selectedLevel,
        search,
      });
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedLevel, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh interval (every 8s if active)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchLogs();
    }, 8000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchLogs]);

  const handlePrune = async () => {
    if (!confirm('Run 7-day retention cleanup now? Any logs older than 7 days will be permanently deleted.')) return;
    setPruning(true);
    setPruneResult(null);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: 7 }),
      });
      const data = await res.json();
      if (data.success) {
        setPruneResult(`Retention cleanup completed: Pruned ${data.deletedCount} logs older than 7 days.`);
        fetchLogs();
      } else {
        alert('Pruning failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while requesting log retention cleanup.');
    } finally {
      setPruning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specific log entry?')) return;
    try {
      const res = await fetch(`/api/admin/logs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'HTTP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300 shadow-xs">
            <Globe className="w-3 h-3 text-sky-600" /> HTTP
          </span>
        );
      case 'PAYMENT_FAILURE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> PAYMENT FAILED
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 shadow-xs">
            <AlertCircle className="w-3 h-3 text-red-600" /> ERROR
          </span>
        );
      case 'PAYMENT_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAYMENT OK
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> WARN
          </span>
        );
      case 'DEBUG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300 shadow-xs">
            <Terminal className="w-3 h-3 text-stone-600" /> DEBUG
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
            <Info className="w-3 h-3 text-blue-600" /> INFO
          </span>
        );
    }
  };

  const getDurationBadge = (durationMs?: number) => {
    if (typeof durationMs !== 'number') return null;
    let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (durationMs > 500) {
      colorClass = 'bg-rose-50 text-rose-800 border-rose-300';
    } else if (durationMs > 200) {
      colorClass = 'bg-amber-50 text-amber-900 border-amber-300';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${colorClass} shadow-xs`}>
        <Timer className="w-3 h-3 opacity-80" />
        <span>{durationMs}ms</span>
      </span>
    );
  };

  const getHttpStatusBadge = (status?: number) => {
    if (typeof status !== 'number') return null;
    let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (status >= 500) {
      colorClass = 'bg-rose-50 text-rose-800 border-rose-300';
    } else if (status >= 400) {
      colorClass = 'bg-amber-50 text-amber-900 border-amber-300';
    } else if (status >= 300) {
      colorClass = 'bg-blue-50 text-blue-800 border-blue-300';
    }

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${colorClass} shadow-xs`}>
        {status}
      </span>
    );
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    const m = method.toUpperCase();
    const colors: Record<string, string> = {
      GET: 'bg-sky-50 text-sky-800 border-sky-300',
      POST: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      PUT: 'bg-amber-50 text-amber-900 border-amber-300',
      PATCH: 'bg-amber-50 text-amber-900 border-amber-300',
      DELETE: 'bg-rose-50 text-rose-800 border-rose-300',
    };
    const c = colors[m] || 'bg-stone-50 text-stone-700 border-stone-300';
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${c} shadow-xs`}>
        {m}
      </span>
    );
  };

  const paymentFailuresCount = stats.countsByLevel['PAYMENT_FAILURE'] || 0;
  const errorsCount = stats.countsByLevel['ERROR'] || 0;
  const paymentSuccessCount = stats.countsByLevel['PAYMENT_SUCCESS'] || 0;
  const httpCount = (stats.countsByLevel['HTTP'] || 0) + (stats.analytics?.totalHttpRequests || 0);
  const avgResponseTime = stats.analytics?.avgResponseTimeMs || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E65C00]/20 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFF0E0] border border-[#E65C00]/30 text-[#E65C00]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#3D1A00] tracking-tight">Request Analytics &amp; System Logs</h1>
              <p className="text-xs text-[#6B3A2A] mt-0.5">
                Real-time request duration monitoring, response time analytics, and automated <strong className="text-[#E65C00] font-bold">7-Day Retention</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showAnalyticsPanel
                ? 'bg-[#FFF0E0] text-[#E65C00] border-[#E65C00]/40 shadow-xs'
                : 'bg-white hover:bg-[#FFF5EB] text-[#6B3A2A] border-[#E65C00]/25'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#E65C00]" />
            <span>Performance Analytics</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white hover:bg-[#FFF5EB] text-[#6B3A2A] border-[#E65C00]/25'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600' : ''}`} />
            <span>Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-white hover:bg-[#FFF5EB] text-[#3D1A00] border border-[#E65C00]/25 rounded-xl transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handlePrune}
            disabled={pruning}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl border border-red-500/30 shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{pruning ? 'Purging...' : 'Purge Logs > 7 Days'}</span>
          </button>
        </div>
      </div>

      {pruneResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pruneResult}</span>
        </div>
      )}

      {/* KPI Overview Cards with Request Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Average Response Time */}
        <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6B3A2A] text-xs font-bold uppercase tracking-wider">
            <span>Avg Response Time</span>
            <Gauge className="w-4 h-4 text-[#E65C00]" />
          </div>
          <p className="text-2xl font-black text-[#3D1A00] font-mono">
            {avgResponseTime > 0 ? `${avgResponseTime}ms` : '—'}
          </p>
          <p className="text-[11px] text-[#8C6D62]">
            {avgResponseTime <= 100
              ? '⚡ Excellent (< 100ms)'
              : avgResponseTime <= 300
              ? '⚡ Good (< 300ms)'
              : '🐢 Attention needed (> 300ms)'}
          </p>
        </div>

        {/* HTTP Requests Tracked */}
        <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6B3A2A] text-xs font-bold uppercase tracking-wider">
            <span>HTTP Requests</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#3D1A00] font-mono">{httpCount}</p>
          <p className="text-[11px] text-[#8C6D62]">
            Min: {stats.analytics?.minResponseTimeMs || 0}ms · Max: {stats.analytics?.maxResponseTimeMs || 0}ms
          </p>
        </div>

        {/* Payment Failures */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold uppercase tracking-wider">
            <span>Payment Failures</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 font-mono">{paymentFailuresCount}</p>
          <p className="text-[11px] text-rose-700 font-medium">Alerts sent to REPORT_MAIL</p>
        </div>

        {/* System & HTTP Errors */}
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-red-800 text-xs font-bold uppercase tracking-wider">
            <span>Errors &amp; Exceptions</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-900 font-mono">{errorsCount}</p>
          <p className="text-[11px] text-red-700 font-medium">5xx / DB / System errors</p>
        </div>
      </div>

      {/* Collapsible Performance Analytics Inspector */}
      {showAnalyticsPanel && stats.analytics && (
        <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E65C00]/20 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E65C00]" />
              <h2 className="text-base font-bold text-[#3D1A00]">HTTP Request Duration &amp; Endpoint Analytics</h2>
            </div>
            <span className="text-xs text-[#8C6D62] font-mono">Sample: last 300 requests</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slowest Routes Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B3A2A] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Slowest Endpoints by Avg Response Time</span>
              </h3>
              <div className="bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl overflow-hidden divide-y divide-[#E65C00]/15">
                {stats.analytics.slowestRoutes?.length > 0 ? (
                  stats.analytics.slowestRoutes.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-mono text-[#3D1A00] font-medium truncate">{item.route}</p>
                        <p className="text-[10px] text-[#8C6D62]">{item.count} total requests</p>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] shrink-0 border ${
                          item.avgMs > 400
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : item.avgMs > 150
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {item.avgMs}ms
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#8C6D62] text-xs">No HTTP logs recorded yet</div>
                )}
              </div>
            </div>

            {/* Status Code & Speed Tiers */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B3A2A] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Response Time &amp; Status Code Summary</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FFF9F5] border border-[#E65C00]/20 p-3 rounded-xl space-y-1">
                  <span className="text-[#8C6D62] text-[10px] uppercase font-bold">Fastest Request</span>
                  <p className="text-xl font-mono font-bold text-emerald-700">
                    {stats.analytics.minResponseTimeMs}ms
                  </p>
                </div>
                <div className="bg-[#FFF9F5] border border-[#E65C00]/20 p-3 rounded-xl space-y-1">
                  <span className="text-[#8C6D62] text-[10px] uppercase font-bold">Peak Slowest Request</span>
                  <p className="text-xl font-mono font-bold text-rose-700">
                    {stats.analytics.maxResponseTimeMs}ms
                  </p>
                </div>
              </div>

              {/* Status Code Breakdown */}
              <div className="bg-[#FFF9F5] border border-[#E65C00]/20 p-3.5 rounded-xl space-y-2">
                <span className="text-[#6B3A2A] text-[11px] font-bold block">Status Code Distribution</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 font-bold block">2xx OK</span>
                    <span className="text-base font-mono font-bold text-[#3D1A00]">
                      {stats.analytics.statusCounts?.['2xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg">
                    <span className="text-[10px] text-blue-800 font-bold block">3xx Redir</span>
                    <span className="text-base font-mono font-bold text-[#3D1A00]">
                      {stats.analytics.statusCounts?.['3xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <span className="text-[10px] text-amber-800 font-bold block">4xx Client</span>
                    <span className="text-base font-mono font-bold text-[#3D1A00]">
                      {stats.analytics.statusCounts?.['4xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                    <span className="text-[10px] text-rose-800 font-bold block">5xx Error</span>
                    <span className="text-base font-mono font-bold text-[#3D1A00]">
                      {stats.analytics.statusCounts?.['5xx'] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8C6D62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by route, status, duration, IP, error..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl pl-9 pr-4 py-2 text-xs text-[#3D1A00] placeholder-[#8C6D62] focus:outline-none focus:border-[#E65C00] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'HTTP', label: 'HTTP Requests', badge: stats.countsByLevel['HTTP'] || stats.analytics?.totalHttpRequests },
            { id: 'PAYMENT_FAILURE', label: 'Payment Failed', badge: paymentFailuresCount },
            { id: 'ERROR', label: 'Errors', badge: errorsCount },
            { id: 'PAYMENT_SUCCESS', label: 'Payment OK', badge: paymentSuccessCount },
            { id: 'WARN', label: 'Warnings' },
            { id: 'INFO', label: 'Info' },
          ].map((item) => {
            const isSelected = selectedLevel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedLevel(item.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white border-transparent'
                    : 'bg-white text-[#6B3A2A] border-[#E65C00]/25 hover:bg-[#FFF5EB] hover:text-[#E65C00]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : item.id === 'PAYMENT_FAILURE'
                        ? 'bg-rose-100 text-rose-800'
                        : item.id === 'HTTP'
                        ? 'bg-sky-100 text-sky-800'
                        : item.id === 'ERROR'
                        ? 'bg-red-100 text-red-800'
                        : item.id === 'PAYMENT_SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#FFF0E0] text-[#E65C00]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white border border-[#E65C00]/20 rounded-2xl overflow-hidden shadow-sm">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-[#8C6D62] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#E65C00]" />
            <p className="text-xs font-semibold text-[#3D1A00]">Loading system logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#8C6D62] space-y-2">
            <Activity className="w-8 h-8 mx-auto text-[#8C6D62]" />
            <p className="text-sm font-bold text-[#3D1A00]">No logs found matching your filter</p>
            <p className="text-xs text-[#8C6D62]">Logs older than 7 days are automatically pruned from the database.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E65C00]/15">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const formattedDate = new Date(log.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              const details = log.details as any;
              const durationMs = details?.durationMs;
              const httpMethod = details?.method;
              const httpStatus = details?.status;

              return (
                <div key={log.id} className="hover:bg-[#FFF9F5] transition-colors">
                  {/* Row Header */}
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <button className="text-[#8C6D62] hover:text-[#E65C00] mt-0.5 md:mt-0 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#E65C00]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#8C6D62]" />
                        )}
                      </button>

                      <div className="shrink-0">{getLevelBadge(log.level)}</div>

                      {/* Method & Status badges for HTTP logs */}
                      {httpMethod && <div className="shrink-0">{getMethodBadge(httpMethod)}</div>}
                      {httpStatus && <div className="shrink-0">{getHttpStatusBadge(httpStatus)}</div>}

                      {/* Source tag if not HTTP */}
                      {!httpMethod && (
                        <div className="shrink-0">
                          <span className="font-mono text-[11px] bg-[#FFF5EB] border border-[#E65C00]/20 text-[#6B3A2A] px-2 py-0.5 rounded-md font-medium">
                            {log.source}
                          </span>
                        </div>
                      )}

                      {/* Duration badge prominently displayed */}
                      {durationMs !== undefined && (
                        <div className="shrink-0">{getDurationBadge(durationMs)}</div>
                      )}

                      <p className="text-xs font-semibold text-[#3D1A00] truncate max-w-xl">{log.message}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-7 md:ml-0">
                      <span className="text-[11px] font-mono text-[#8C6D62] whitespace-nowrap">{formattedDate}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(log.id);
                        }}
                        className="text-[#8C6D62] hover:text-red-600 p-1 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details & Timing Breakdown */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-2 bg-[#FFFDFB] border-t border-[#E65C00]/15 space-y-3">
                      {/* Response Time Breakdown Card if HTTP request */}
                      {durationMs !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-[#E65C00]/20 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#E65C00] font-bold flex items-center gap-1.5">
                              <Timer className="w-4 h-4" />
                              <span>Response Duration: {durationMs}ms</span>
                            </span>
                            <span className="text-[#6B3A2A] font-mono text-[11px]">
                              Status: {httpStatus} · Method: {httpMethod}
                            </span>
                          </div>
                          {/* Duration Visual Bar */}
                          <div className="w-full bg-[#FFF0E0] h-2 rounded-full overflow-hidden border border-[#E65C00]/15">
                            <div
                              className={`h-full rounded-full transition-all ${
                                durationMs > 500
                                  ? 'bg-rose-500'
                                  : durationMs > 200
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, (durationMs / 1000) * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-[#E65C00]/20 shadow-xs">
                          <span className="text-[#8C6D62] block text-[10px] uppercase font-bold">Log ID</span>
                          <span className="font-mono text-[#3D1A00] break-all">{log.id}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#E65C00]/20 shadow-xs">
                          <span className="text-[#8C6D62] block text-[10px] uppercase font-bold">Timestamp (UTC)</span>
                          <span className="font-mono text-[#3D1A00]">{new Date(log.createdAt).toISOString()}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#E65C00]/20 shadow-xs">
                          <span className="text-[#8C6D62] block text-[10px] uppercase font-bold">IP &amp; Client</span>
                          <span className="font-mono text-[#3D1A00]">
                            {log.ip || details?.ip || '127.0.0.1'} · {details?.userAgent ? details.userAgent.slice(0, 30) + '...' : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {log.details && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#6B3A2A] uppercase tracking-wider block">
                            Structured Payload &amp; Request Metadata
                          </span>
                          <pre className="bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl p-3.5 text-[11px] font-mono text-[#3D1A00] overflow-x-auto max-h-80 leading-relaxed shadow-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E65C00]/20 bg-white flex items-center justify-between text-xs">
            <span className="text-[#6B3A2A]">
              Page <strong className="text-[#3D1A00]">{page}</strong> of <strong className="text-[#3D1A00]">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E65C00]/25 text-[#3D1A00] disabled:opacity-40 hover:bg-[#FFF5EB] transition-colors font-semibold shadow-xs"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E65C00]/25 text-[#3D1A00] disabled:opacity-40 hover:bg-[#FFF5EB] transition-colors font-semibold shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
