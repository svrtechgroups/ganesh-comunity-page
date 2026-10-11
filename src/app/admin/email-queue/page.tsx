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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E65C00]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#E65C00] text-xs font-bold uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>Database-Backed Email Queue</span>
          </div>
          <h1 className="text-2xl font-black text-[#3D1A00] mt-1">
            Email Queue &amp; Worker Monitor
          </h1>
          <p className="text-xs text-[#6B3A2A] mt-0.5">
            Real-time rate-limited background processing: 10 emails every 20 seconds, chunked in 500 items max.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-[#FFF5EB] text-[#3D1A00] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-[#E65C00]/25 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleManualTick}
            disabled={actionLoading}
            className="px-4 py-2 bg-gradient-to-r from-[#FF7A00] to-[#E65C00] hover:from-[#E65C00] hover:to-[#CC4000] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{actionLoading ? 'Processing Batch...' : 'Process 10 Now'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#FFF0E0] border border-[#E65C00]/30 rounded-xl text-[#3D1A00] text-xs flex items-center justify-between shadow-xs">
          <span className="font-medium">{message}</span>
          <button onClick={() => setMessage(null)} className="text-[#E65C00] hover:text-[#3D1A00] font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Queue */}
        <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6B3A2A] mb-1 font-bold uppercase tracking-wider">
            <span>Total In Database</span>
            <Layers className="w-4 h-4 text-[#8C6D62]" />
          </div>
          <div className="text-2xl font-black text-[#3D1A00]">
            {data?.counts.total ?? '—'}
          </div>
          <span className="text-[10px] text-[#8C6D62] block mt-1">
            EmailQueue table records
          </span>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1 font-bold uppercase tracking-wider">
            <span>Pending Delivery</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900">
            {data?.counts.pending ?? '—'}
          </div>
          <span className="text-[10px] text-amber-700 block mt-1 font-medium">
            Awaiting background worker tick
          </span>
        </div>

        {/* Sent */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1 font-bold uppercase tracking-wider">
            <span>Sent Successfully</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {data?.counts.sent ?? '—'}
          </div>
          <span className="text-[10px] text-emerald-700 block mt-1 font-medium">
            {data?.deleteOnSendEnabled
              ? 'Purged after send (DELETE_SENT_EMAILS=true)'
              : 'Retained with status="sent"'}
          </span>
        </div>

        {/* Failed */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1 font-bold uppercase tracking-wider">
            <span>Failed (Max Retries)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">
            {data?.counts.failed ?? '—'}
          </div>
          <span className="text-[10px] text-rose-700 block mt-1 font-medium">
            Exceeded retry safety limit (5 tries)
          </span>
        </div>
      </div>

      {/* Architectural Configuration Overview */}
      <div className="bg-white border border-[#E65C00]/20 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[#3D1A00] border-b border-[#E65C00]/20 pb-3">
          <ShieldCheck className="w-4 h-4 text-[#E65C00]" />
          <span>Queue Engine Architecture &amp; Lifecycle Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#FFF9F5] p-3.5 rounded-xl border border-[#E65C00]/15 space-y-1">
            <span className="text-[#6B3A2A] font-semibold block">Worker Interval</span>
            <div className="text-sm font-black text-[#3D1A00] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E65C00]" />
              <span>20 Seconds</span>
            </div>
            <p className="text-[10px] text-[#8C6D62]">Runs continuously via Node.js setInterval</p>
          </div>

          <div className="bg-[#FFF9F5] p-3.5 rounded-xl border border-[#E65C00]/15 space-y-1">
            <span className="text-[#6B3A2A] font-semibold block">Tick Concurrency</span>
            <div className="text-sm font-black text-[#3D1A00] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#E65C00]" />
              <span>10 Emails / Tick</span>
            </div>
            <p className="text-[10px] text-[#8C6D62]">Dispatched via Nodemailer Promise.all</p>
          </div>

          <div className="bg-[#FFF9F5] p-3.5 rounded-xl border border-[#E65C00]/15 space-y-1">
            <span className="text-[#6B3A2A] font-semibold block">Memory Protection</span>
            <div className="text-sm font-black text-[#3D1A00] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#E65C00]" />
              <span>500 Items / Chunk</span>
            </div>
            <p className="text-[10px] text-[#8C6D62]">Prisma createMany with skipDuplicates</p>
          </div>

          <div className="bg-[#FFF9F5] p-3.5 rounded-xl border border-[#E65C00]/15 space-y-1">
            <span className="text-[#6B3A2A] font-semibold block">Deletion Policy</span>
            <div className="text-sm font-black text-[#3D1A00] flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-[#E65C00]" />
              <span>{data?.deleteOnSendEnabled ? 'Enabled (true)' : 'Retained (false)'}</span>
            </div>
            <p className="text-[10px] text-[#8C6D62]">Configured via DELETE_SENT_EMAILS in .env</p>
          </div>
        </div>
      </div>

      {/* Recent Pending Table */}
      <div className="bg-white border border-[#E65C00]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E65C00]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E65C00]" />
            <h3 className="text-sm font-bold text-[#3D1A00]">
              Next Queue Items for Dispatch (Top 10 Oldest)
            </h3>
          </div>
          <span className="text-xs text-[#8C6D62]">Ordered by createdAt ASC</span>
        </div>

        {data?.recentPending && data.recentPending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3D1A00]">
              <thead className="bg-[#FFF9F5] text-[#6B3A2A] uppercase text-[10px] tracking-wider border-b border-[#E65C00]/15 font-bold">
                <tr>
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4 text-center">Tries</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Queued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E65C00]/15 font-mono">
                {data.recentPending.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF9F5] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#3D1A00]">{item.email}</td>
                    <td className="py-3 px-4 font-sans text-[#6B3A2A] max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3 px-4 text-[#8C6D62] font-sans">
                      {item.campaignType || 'general'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={item.tryCount > 0 ? 'text-[#E65C00]' : 'text-[#8C6D62]'}>
                        {item.tryCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 uppercase font-sans">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#8C6D62] font-sans text-[11px]">
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
          <div className="p-8 text-center text-[#8C6D62] text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="font-bold text-[#3D1A00] text-sm">Queue is Clear</p>
            <p className="text-[11px] text-[#8C6D62] mt-0.5">All pending emails have been dispatched by the background worker.</p>
          </div>
        )}
      </div>
    </div>
  );
}
