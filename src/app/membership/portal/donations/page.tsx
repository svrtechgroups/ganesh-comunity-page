'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import {
  ArrowLeft, Heart, CheckCircle, CreditCard, Calendar, RefreshCw, Inbox,
  ExternalLink, Download, Copy, XCircle, Clock,
} from 'lucide-react';

interface DonationItem {
  id: string;
  ticketToken?: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string;
  createdAt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      title="Copy ticket link"
      className="p-1.5 rounded-lg text-[#6B3A2A] hover:text-[#E65C00] hover:bg-[#E65C00]/10 transition-colors"
    >
      {copied
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

function MyDonationsContent() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDonations() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/user/donations', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setDonations(data.data);
        } else {
          setError(data.error || 'Failed to load donations.');
        }
      } catch {
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, []);

  const totalGiven = donations.reduce((acc, d) => acc + d.amount, 0);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] py-12 px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <Link
          href="/membership/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E65C00] hover:underline mb-6 block"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Profile</span>
        </Link>

        <div className="text-center space-y-3">
          <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 text-xs font-black px-4 py-1.5 rounded-full uppercase inline-block shadow-sm">
            MY BOOKING &amp; SEVA HISTORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-cinzel gold-foil-text">
            MY CONTRIBUTIONS
          </h1>
          <p className="text-xs text-[#6B3A2A] max-w-xl mx-auto">
            All bookings and payments made by{' '}
            <strong className="text-[#E65C00]">{user?.fullName || user?.email}</strong>.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-2">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Contributed</span>
            <Heart className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#E65C00]">
            £{totalGiven.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#6B3A2A] block">Your generous contributions to the community</span>
        </div>

        <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-2">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Transactions</span>
            <CreditCard className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#3D1A00]">
            {donations.length}
          </span>
          <span className="text-[10px] text-emerald-600 block">
            {donations.filter(d => d.status === 'Completed').length} completed
          </span>
        </div>
      </div>

      {/* Donations List */}
      <div className="max-w-4xl mx-auto temple-card rounded-3xl border border-[#E65C00]/25 overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#E65C00]/20 pb-4">
          <div>
            <h3 className="text-lg font-black font-cinzel text-[#3D1A00]">BOOKING RECEIPTS</h3>
            <p className="text-xs text-[#6B3A2A]">Click "View Ticket" to open or share your official receipt.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-[#E65C00] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6B3A2A]">Loading your bookings…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-rose-600 text-xs">{error}</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-[#FFF0E0] rounded-full flex items-center justify-center mx-auto border border-[#E65C00]/25">
              <Inbox className="w-8 h-8 text-[#6B3A2A]" />
            </div>
            <p className="text-sm text-[#6B3A2A] font-bold">No bookings yet</p>
            <p className="text-xs text-[#6B3A2A]/70">Make your first booking or seva contribution to the MITRA community.</p>
            <Link
              href="/donate"
              className="gold-button inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider shadow-lg"
            >
              <Heart className="w-4 h-4 text-white" />
              <span>Make a Booking</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((d) => {
              const ticketToken = d.ticketToken || d.id;
              const ticketUrl = `${baseUrl}/ticket/${ticketToken}`;
              return (
                <div
                  key={d.id}
                  className="bg-[#FFF0E0] border border-[#E65C00]/15 hover:border-[#E65C00]/40 rounded-2xl p-4 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    {/* Left — description + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#3D1A00] font-bold text-sm truncate">{d.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="font-mono font-black text-[#E65C00] text-sm">
                          £{d.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#6B3A2A] font-mono bg-[#FFF8F0] px-2 py-0.5 rounded-full border border-[#E65C00]/15">
                          {d.id}
                        </span>
                        {/* Status badge — colour-coded */}
                        {d.status === 'Completed' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        ) : d.status === 'Failed' ? (
                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {d.status}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-[#6B3A2A]">
                          <Calendar className="w-3 h-3 text-[#E65C00]" />
                          {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Right — ticket actions (only for Completed) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {d.status === 'Completed' ? (
                        <>
                          <CopyButton text={ticketUrl} />
                          <Link
                            href={`/ticket/${ticketToken}`}
                            target="_blank"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#E65C00] border border-[#E65C00]/30 hover:bg-[#FFF0E0] px-3 py-1.5 rounded-full transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Ticket</span>
                          </Link>
                          <Link
                            href={`/ticket/${ticketToken}`}
                            target="_blank"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#E65C00] hover:bg-[#FF7A00] px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </Link>
                        </>
                      ) : d.status === 'Failed' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Payment Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto text-center">
        <Link
          href="/donate"
          className="gold-button inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
        >
          <Heart className="w-5 h-5 text-white" />
          <span>Make Another Booking</span>
        </Link>
      </div>

    </div>
  );
}

export default function MyDonationsPage() {
  return (
    <AuthGuard requiredRole="Member">
      <MyDonationsContent />
    </AuthGuard>
  );
}
