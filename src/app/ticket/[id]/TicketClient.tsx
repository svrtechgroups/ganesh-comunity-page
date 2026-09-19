'use client';

import Link from 'next/link';
import { CheckCircle, Download, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  description: string;
  paymentMethod: string;
  createdAt: string;
}

interface TicketClientProps {
  payment: PaymentData;
  qrDataUrl: string;
  ticketUrl: string;
}

export default function TicketClient({ payment, qrDataUrl, ticketUrl }: TicketClientProps) {
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

  const dateStr = new Date(payment.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .ticket-wrapper { box-shadow: none !important; border: 2px solid #D4AF37 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-start py-10 px-4">

        {/* Top Nav — hidden on print */}
        <div className="no-print w-full max-w-2xl mb-6 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1">
            ← Back to MITRA UK
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] border border-[#E65C00]/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-white bg-[#E65C00] hover:bg-[#FF7A00] px-4 py-1.5 rounded-full font-black transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Ticket Card */}
        <div
          className="ticket-wrapper w-full max-w-2xl rounded-3xl overflow-hidden shadow-md border-2 border-[#E65C00]"
          style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
        >
          {/* Header Band */}
          <div className="bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] px-8 py-6 text-center relative overflow-hidden border-b border-[#E65C00]/20">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #E65C00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #E65C00 0%, transparent 50%)'
            }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E65C00] shrink-0 bg-white p-0.5 flex items-center justify-center">
                  <img src="/assets/favicon.ico" alt="MITRA UK" className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <p className="text-[#3D1A00] font-black text-lg tracking-widest">MITRA UK</p>
                  <p className="text-[#6B3A2A] text-[9px] font-bold uppercase tracking-widest">Official Booking Receipt</p>
                </div>
              </div>
              <div className="h-px bg-[#E65C00]/25 my-3" />
              <p className="text-[#6B3A2A] text-[10px] font-bold uppercase tracking-[0.3em]">
                Mana Indian Telugu Roots Abroad · London, UK
              </p>
            </div>
          </div>

          {/* Main Body */}
          <div className="bg-white px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">

              {/* Left — Details */}
              <div className="flex-1 space-y-5">

                {/* Receipt No */}
                <div>
                  <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-1">Receipt / Ticket No.</p>
                  <p className="font-mono text-[#E65C00] font-black text-sm tracking-wider">{payment.id.toUpperCase()}</p>
                </div>

                {/* Donor */}
                <div>
                  <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-1">Donor Name</p>
                  <p className="text-[#3D1A00] font-bold text-base">{payment.customerName}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-1">Purpose / Description</p>
                  <p className="text-[#3D1A00] text-sm leading-relaxed">{payment.description}</p>
                </div>

                {/* Amount */}
                <div className="bg-[#FFF0E0] border border-[#E65C00]/20 rounded-2xl p-4 inline-block">
                  <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-1">Amount Paid</p>
                  <p className="text-3xl font-black text-[#E65C00]">
                    £{payment.amount.toFixed(2)}
                    <span className="text-sm font-bold text-[#6B3A2A] ml-1">{payment.currency}</span>
                  </p>
                </div>

                {/* Grid of meta info */}
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#E65C00]/15 pt-4">
                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Payment Method</p>
                    <p className="text-[#3D1A00] font-semibold">{payment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Status</p>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/25">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {payment.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Date & Time</p>
                    <p className="text-[#3D1A00] font-semibold">{dateStr}</p>
                  </div>
                </div>
              </div>

              {/* Right — QR Code */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="p-3 bg-white rounded-2xl border-2 border-[#E65C00] shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Scan to verify ticket" width={160} height={160} />
                </div>
                <p className="text-[9px] text-[#6B3A2A] text-center font-bold uppercase tracking-wider max-w-[140px] leading-tight">
                  Scan to verify this booking receipt
                </p>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print flex items-center gap-1 text-[10px] text-[#E65C00] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open ticket link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Band */}
          <div className="bg-[#FFF0E0] border-t border-[#E65C00]/20 px-8 py-4 text-center">
            <p className="text-[9px] text-[#6B3A2A] uppercase tracking-wider">
              This is an official computer-generated receipt. No signature required. · MITRA UK (MITRA) · Registered UK Community Organisation
            </p>
            <p className="text-[9px] text-[#6B3A2A] mt-1">
              Verify online: <span className="text-[#E65C00] font-mono">{ticketUrl}</span>
            </p>
          </div>

          {/* Perforation effect */}
          <div className="bg-[#E65C00] h-0.5 w-full opacity-20" />
        </div>

        {/* Action buttons — hidden on print */}
        <div className="no-print mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePrint}
            className="gold-button flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 text-white" />
            <span>Download / Print Ticket</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider border border-[#E65C00]/40 text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
          >
            <Copy className="w-5 h-5" />
            <span>{copied ? '✓ Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>

        <p className="no-print mt-6 text-[10px] text-[#6B3A2A] text-center max-w-md">
          This ticket link is publicly accessible — share it with anyone to verify this booking.
        </p>
      </div>
    </>
  );
}
