import Link from 'next/link';
import { XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface TicketBlockedProps {
  status: string;
  customerName: string;
  description: string;
  amount: number;
  currency: string;
  paymentId: string;
}

export default function TicketBlocked({
  status,
  customerName,
  description,
  amount,
  currency,
  paymentId,
}: TicketBlockedProps) {
  const isFailed = status === 'Failed';
  const isPending = status === 'Pending';

  const statusConfig = isFailed
    ? {
        icon: <XCircle className="w-14 h-14 text-rose-500" />,
        label: 'Payment Failed',
        labelClass: 'bg-rose-50 text-rose-700 border-rose-300',
        borderColor: 'border-rose-200',
        glowColor: 'shadow-md',
        headline: 'This ticket is not available.',
        subtext:
          'The payment for this transaction did not go through. No ticket or receipt has been issued.',
        hint: 'If you believe this is an error, please contact us or try booking again.',
      }
    : isPending
    ? {
        icon: <Clock className="w-14 h-14 text-amber-500" />,
        label: 'Payment Pending',
        labelClass: 'bg-amber-50 text-amber-700 border-amber-300',
        borderColor: 'border-amber-200',
        glowColor: 'shadow-md',
        headline: 'Payment is still processing.',
        subtext:
          'Your payment has not yet been confirmed. The ticket will be available once the payment is completed.',
        hint: 'This usually takes a few seconds. Please refresh the page or check back shortly.',
      }
    : {
        icon: <AlertTriangle className="w-14 h-14 text-orange-500" />,
        label: `Status: ${status}`,
        labelClass: 'bg-orange-50 text-orange-700 border-orange-300',
        borderColor: 'border-orange-200',
        glowColor: 'shadow-md',
        headline: 'Ticket unavailable.',
        subtext: `The payment status is "${status}". Tickets are only issued for completed payments.`,
        hint: 'Please contact support if you have questions about this transaction.',
      };

  return (
    <div
      className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center py-12 px-4"
      style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
    >
      {/* Back link */}
      <div className="w-full max-w-lg mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E65C00] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to MITRA UK
        </Link>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-lg rounded-3xl border-2 bg-white ${statusConfig.borderColor} ${statusConfig.glowColor} overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFF8F0] via-white to-[#FFF8F0] px-8 py-6 text-center border-b border-[#E65C00]/20">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/assets/favicon.ico"
              alt="MITRA UK"
              className="w-9 h-9 rounded-full object-contain border-2 border-[#E65C00] bg-white p-0.5"
            />
            <div className="text-left">
              <p className="text-[#3D1A00] font-black text-base tracking-widest">MITRA UK</p>
              <p className="text-[#6B3A2A] text-[9px] font-bold uppercase tracking-widest">
                Booking Ticket
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-8 py-10 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-[#FFF0E0] border border-[#E65C00]/20 flex items-center justify-center">
            {statusConfig.icon}
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${statusConfig.labelClass}`}
          >
            {statusConfig.label}
          </span>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#3D1A00]">{statusConfig.headline}</h1>
            <p className="text-sm text-[#6B3A2A] leading-relaxed max-w-sm">{statusConfig.subtext}</p>
          </div>

          {/* Payment details */}
          <div className="w-full bg-[#FFF8F0] border border-[#E65C00]/20 rounded-2xl p-5 space-y-3 text-left shadow-sm">
            <div>
              <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">
                Transaction ID
              </p>
              <p className="font-mono text-[#E65C00] text-xs font-black tracking-wider">
                {paymentId.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">
                Name
              </p>
              <p className="text-[#3D1A00] text-sm font-bold">{customerName}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">
                Description
              </p>
              <p className="text-[#3D1A00] text-sm">{description}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">
                Amount
              </p>
              <p className="text-[#E65C00] font-black text-xl">
                £{amount.toFixed(2)}{' '}
                <span className="text-sm font-bold text-[#6B3A2A]">{currency}</span>
              </p>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-[#6B3A2A]/70 max-w-sm leading-relaxed">{statusConfig.hint}</p>
        </div>

        {/* Footer */}
        <div className="bg-[#FFF0E0] border-t border-[#E65C00]/20 px-8 py-4 text-center">
          <p className="text-[9px] text-[#6B3A2A] uppercase tracking-wider">
            MITRA UK (MITRA) · Registered UK Community Organisation
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider text-white bg-[#E65C00] hover:bg-[#FF7A00] transition-colors shadow-md"
        >
          Try Again
        </Link>
        <Link
          href="/membership/portal/donations"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider border border-[#E65C00]/40 text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
        >
          My Bookings
        </Link>
      </div>
    </div>
  );
}
