'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface QueueStats {
  workerRunning: boolean;
  deleteOnSendEnabled: boolean;
  counts: {
    total: number;
    pending: number;
    sent: number;
    failed: number;
  };
  workerConfig?: {
    intervalSeconds: number;
    batchSize: number;
    chunkSize: number;
  };
  recentPending?: Array<{
    id: string;
    email: string;
    subject: string;
    status: string;
    tryCount: number;
    campaignType: string | null;
    campaignId: string | null;
    createdAt: string;
  }>;
}

export default function EmailQueueAdminPage() {
  const [data, setData] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-queue');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed fetching email queue stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds for live monitoring
    const timer = setInterval(fetchStats, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleManualTick = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch('/api/email-queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_now' }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(json.message || 'Processed batch tick.');
        fetchStats();
      } else {
        setMessage(json.error || 'Failed executing tick.');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error triggering manual tick.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-mitra-gold text-xs font-bold uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>Database-Backed Email Queue</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Email Queue &amp; Worker Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time rate-limited background processing: 10 emails every 20 seconds, chunked in 500 items max.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleManualTick}
            disabled={actionLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{actionLoading ? 'Processing Batch...' : 'Process 10 Now'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-amber-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Queue */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total In Database</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {data?.counts.total ?? '—'}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            EmailQueue table records
          </span>
        </div>

        {/* Pending */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span>Pending Delivery</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {data?.counts.pending ?? '—'}
          </div>
          <span className="text-[10px] text-amber-500/80 block mt-1">
            Awaiting background worker tick
          </span>
        </div>

        {/* Sent */}
        <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span>Sent Successfully</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {data?.counts.sent ?? '—'}
          </div>
          <span className="text-[10px] text-emerald-500/80 block mt-1">
            {data?.deleteOnSendEnabled
              ? 'Purged after send (DELETE_SENT_EMAILS=true)'
              : 'Retained with status="sent"'}
          </span>
        </div>

        {/* Failed */}
        <div className="bg-slate-950/70 border border-red-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-400 mb-1">
            <span>Failed (Max Retries)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {data?.counts.failed ?? '—'}
          </div>
          <span className="text-[10px] text-red-500/80 block mt-1">
            Exceeded retry safety limit (5 tries)
          </span>
        </div>
      </div>

      {/* Architectural Configuration Overview */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
          <ShieldCheck className="w-4 h-4 text-mitra-gold" />
          <span>Queue Engine Architecture &amp; Lifecycle Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Worker Interval</span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-mitra-gold" />
              <span>20 Seconds</span>
            </div>
            <p className="text-[10px] text-slate-500">Runs continuously via Node.js setInterval</p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Tick Concurrency</span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>10 Emails / Tick</span>
            </div>
            <p className="text-[10px] text-slate-500">Dispatched via Nodemailer Promise.all</p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Memory Protection</span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>500 Items / Chunk</span>
            </div>
            <p className="text-[10px] text-slate-500">Prisma createMany with skipDuplicates</p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Deletion Policy</span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-purple-400" />
              <span>{data?.deleteOnSendEnabled ? 'Enabled (true)' : 'Retained (false)'}</span>
            </div>
            <p className="text-[10px] text-slate-500">Configured via DELETE_SENT_EMAILS in .env</p>
          </div>
        </div>
      </div>

      {/* Recent Pending Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Next Queue Items for Dispatch (Top 10 Oldest)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Ordered by createdAt ASC</span>
        </div>

        {data?.recentPending && data.recentPending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4 text-center">Tries</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Queued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.recentPending.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{item.email}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">
                      {item.campaignType || 'general'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={item.tryCount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                        {item.tryCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-sans">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-sans text-[11px]">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
            <p className="font-semibold text-slate-400">Queue is Clear</p>
            <p className="text-[11px] mt-0.5">All pending emails have been dispatched by the background worker.</p>
          </div>
        )}
      </div>
    </div>
  );
}
