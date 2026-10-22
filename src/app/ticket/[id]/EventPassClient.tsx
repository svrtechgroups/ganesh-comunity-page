'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';

export interface EventPassData {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    category?: string;
    date: string;
    time?: string;
    venue: string;
    address?: string;
    bannerUrl?: string;
  };
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  travellingFrom?: string;
  ticketsCount: number;
  adultsCount?: number;
  childrenCount?: number;
  selectedDates?: string[];
  totalAmount: number;
  paymentStatus: string;
  memberId?: string;
  isScanned: boolean;
  scannedAt?: string;
  scannedBy?: string;
  scannedCount: number;
  remainingTickets: number;
  scanStatus: 'FULL_SCANNED' | 'HALF_SCANNED' | 'NOT_SCANNED';
  createdAt: string;
}

interface EventPassClientProps {
  rsvp: EventPassData;
  qrDataUrl: string;
  ticketUrl: string;
}

export default function EventPassClient({ rsvp, qrDataUrl, ticketUrl }: EventPassClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => window.print();

  const formattedBookingDate = new Date(rsvp.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .ticket-wrapper { box-shadow: none !important; border: 2px solid #E65C00 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-start py-8 sm:py-12 px-4">
        
        {/* Top Nav — hidden on print */}
        <div className="no-print w-full max-w-2xl mb-6 flex items-center justify-between">
          <Link
            href="/membership/portal/donations"
            className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Member Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] border border-[#E65C00]/30 px-3.5 py-1.5 rounded-full transition-colors bg-white shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-white bg-[#E65C00] hover:bg-[#FF7A00] px-4 py-1.5 rounded-full font-black transition-all shadow-md hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save Pass</span>
            </button>
          </div>
        </div>

        {/* Pass Card Wrapper */}
        <div
          className="ticket-wrapper w-full max-w-2xl rounded-3xl overflow-hidden shadow-xl border-2 border-[#E65C00] bg-white"
          style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
        >
          {/* Header Band */}
          <div className="bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] px-6 sm:px-8 py-6 text-center relative overflow-hidden border-b border-[#E65C00]/20">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, #E65C00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #E65C00 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E65C00] shrink-0 bg-white p-0.5 flex items-center justify-center shadow-sm">
                  <img src="/assets/favicon.ico" alt="MITRA UK" className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <p className="text-[#3D1A00] font-black text-xl tracking-widest leading-none">MITRA UK</p>
                  <p className="text-[#6B3A2A] text-[10px] font-bold uppercase tracking-widest mt-1">
                    Official Event Entry Pass
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#E65C00]/25 my-3" />
              <p className="text-[#6B3A2A] text-[10px] font-bold uppercase tracking-[0.25em]">
                Mana Indian Telugu Roots Abroad · Verified Attendance
              </p>
            </div>
          </div>

          {/* Live Gate Entry Scan Status Pill */}
          <div className="px-6 sm:px-8 pt-6 pb-2">
            {rsvp.scanStatus === 'FULL_SCANNED' ? (
              <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 rounded-2xl p-3 flex items-center justify-between text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-black">ATTENDED &amp; VERIFIED AT GATE</span>
                    <p className="text-[10px] font-normal text-emerald-700">
                      All {rsvp.ticketsCount} pass(es) have been scanned for entry.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-emerald-100 px-2.5 py-1 rounded-full text-emerald-900 border border-emerald-300">
                  {rsvp.scannedCount}/{rsvp.ticketsCount} In
                </span>
              </div>
            ) : rsvp.scanStatus === 'HALF_SCANNED' ? (
              <div className="bg-amber-50 border border-amber-400 text-amber-800 rounded-2xl p-3 flex items-center justify-between text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-black">PARTIALLY SCANNED</span>
                    <p className="text-[10px] font-normal text-amber-700">
                      {rsvp.scannedCount} attendee(s) admitted · {rsvp.remainingTickets} ticket(s) remaining for gate check-in.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-amber-100 px-2.5 py-1 rounded-full text-amber-900 border border-amber-300">
                  {rsvp.scannedCount}/{rsvp.ticketsCount}
                </span>
              </div>
            ) : (
              <div className="bg-sky-50 border border-sky-400 text-sky-900 rounded-2xl p-3 flex items-center justify-between text-xs font-bold shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-black">VALID ENTRY PASS · READY FOR ENTRANCE</span>
                    <p className="text-[10px] font-normal text-sky-700">
                      Present this pass and QR code at the entrance desk for check-in.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-sky-100 px-2.5 py-1 rounded-full text-sky-900 border border-sky-300">
                  0/{rsvp.ticketsCount} Scanned
                </span>
              </div>
            )}
          </div>

          {/* Main Card Body */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Left — Event & Attendee Details */}
              <div className="flex-1 space-y-5 w-full">
                
                {/* Event Title & Category */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-[#E65C00] font-black uppercase tracking-widest bg-[#FFF0E0] px-2 py-0.5 rounded-full border border-[#E65C00]/20">
                      {rsvp.event?.category || 'Community Celebration'}
                    </span>
                    <span className="font-mono text-[9px] text-[#6B3A2A] font-bold">
                      PASS #{rsvp.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-[#3D1A00] font-black text-xl sm:text-2xl leading-tight">
                    {rsvp.event?.title || 'Community Event'}
                  </h2>
                </div>

                {/* Event Schedule & Venue Highlight */}
                <div className="bg-[#FFF8F0] border border-[#E65C00]/20 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#3D1A00] text-sm">
                        {rsvp.event?.date || 'Date TBD'}
                      </p>
                      {rsvp.event?.time && (
                        <p className="text-[11px] text-[#6B3A2A] font-semibold">{rsvp.event.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-[#E65C00]/15 pt-2.5">
                    <MapPin className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#3D1A00]">{rsvp.event?.venue}</p>
                      {rsvp.event?.address && (
                        <p className="text-[11px] text-[#6B3A2A]">{rsvp.event.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendee & Pass Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#E65C00]/15 pt-4">
                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Primary Attendee</p>
                    <p className="text-[#3D1A00] font-black text-sm">{rsvp.attendeeName}</p>
                    {rsvp.memberId && (
                      <span className="inline-block mt-1 font-mono text-[9px] text-[#E65C00] font-bold bg-[#FFF0E0] px-1.5 py-0.5 rounded border border-[#E65C00]/20">
                        {rsvp.memberId}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Admission Passes</p>
                    <p className="text-[#3D1A00] font-black text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#E65C00]" />
                      <span>{rsvp.ticketsCount} Ticket{rsvp.ticketsCount > 1 ? 's' : ''}</span>
                    </p>
                    <p className="text-[10px] text-[#6B3A2A] mt-0.5">
                      {rsvp.adultsCount || 0} Adult{rsvp.adultsCount !== 1 ? 's' : ''}
                      {rsvp.childrenCount ? `, ${rsvp.childrenCount} Child${rsvp.childrenCount !== 1 ? 'ren' : ''}` : ''}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Contact</p>
                    <p className="text-[#3D1A00] font-semibold text-[11px] truncate">{rsvp.attendeeEmail}</p>
                    {rsvp.attendeePhone && (
                      <p className="text-[#6B3A2A] text-[10px]">{rsvp.attendeePhone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Registration Status</p>
                    <p className="text-[#3D1A00] font-black text-sm">
                      Confirmed RSVP
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Entry Pass Active</span>
                    </p>
                  </div>
                </div>

                {/* Scan Timestamp if verified */}
                {rsvp.scannedAt && (
                  <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2.5 text-[10px] text-emerald-900 font-mono">
                    Entrance Check-in: {new Date(rsvp.scannedAt).toLocaleString('en-GB')}
                    {rsvp.scannedBy ? ` · Scanner: ${rsvp.scannedBy}` : ''}
                  </div>
                )}
              </div>

              {/* Right — Gate Scanner QR Code */}
              <div className="flex flex-col items-center gap-3 shrink-0 self-center md:self-start w-full md:w-auto">
                <div className="p-3.5 bg-white rounded-2xl border-2 border-[#E65C00] shadow-md flex flex-col items-center">
                  <div className="w-[180px] h-[180px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="Gate Check-in QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <div className="w-full text-center mt-2 pt-2 border-t border-[#E65C00]/20">
                    <span className="font-mono text-[10px] text-[#E65C00] font-black tracking-wider block">
                      GATE ENTRY QR
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#6B3A2A] text-center font-bold uppercase tracking-wider max-w-[190px] leading-tight">
                  Present this QR code at entrance for gate scanner check-in
                </p>

                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print flex items-center gap-1 text-[10px] text-[#E65C00] hover:underline font-bold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Direct Pass Link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Band */}
          <div className="bg-[#FFF0E0] border-t border-[#E65C00]/20 px-6 sm:px-8 py-4 text-center">
            <p className="text-[9px] text-[#6B3A2A] uppercase tracking-wider">
              Official Entry Pass · Mana Indian Telugu Roots Abroad (MITRA UK) · Registered UK Community Organisation
            </p>
            <p className="text-[9px] text-[#6B3A2A] mt-1 font-mono">
              Pass ID: <span className="text-[#E65C00] font-bold">{rsvp.id}</span> · Booked: {formattedBookingDate}
            </p>
          </div>

          {/* Perforation visual */}
          <div className="bg-[#E65C00] h-0.5 w-full opacity-20" />
        </div>

        {/* Action Buttons — hidden on print */}
        <div className="no-print mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePrint}
            className="gold-button flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 text-white" />
            <span>Download / Print Entry Pass</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider border border-[#E65C00]/40 text-[#E65C00] hover:bg-[#FFF0E0] transition-colors bg-white shadow-sm"
          >
            <Copy className="w-5 h-5" />
            <span>{copied ? '✓ Pass Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>

        <p className="no-print mt-6 text-[11px] text-[#6B3A2A] text-center max-w-md">
          This digital pass is securely verifiable. You can add it to your mobile wallet, print it, or show the QR code directly on your phone upon arrival.
        </p>
      </div>
    </>
  );
}
