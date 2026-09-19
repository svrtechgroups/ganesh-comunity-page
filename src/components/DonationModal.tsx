'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { trackDonation } from '@/lib/analytics';
import {
  Heart,
  CheckCircle2,
  Lock,
  X,
  Utensils,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationRecord } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Annadanam' | 'Event Donations';
type Step = 'guest-details' | 'details' | 'payment' | 'success';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  cause: string;
  onSuccess: (receiptId: string) => void;
  onBack: () => void;
}

// ── Inner Stripe Checkout Form ────────────────────────────────────────────────

function CheckoutForm({
  clientSecret,
  amount,
  donorName,
  donorEmail,
  cause,
  onSuccess,
  onBack,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    // please include the logged in member id as well hear 
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/donate?payment=success`
          : 'https://mitra.org.uk/donate?payment=success',
        payment_method_data: {
          billing_details: {
            name: donorName,
            email: donorEmail,
          },
        },
      },
      redirect: 'if_required', // Avoid page redirect for card payments
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);

      // Report failure to backend for DB logging and email alert to REPORT_MAIL
      try {
        fetch('/api/payments/report-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: donorName,
            customerEmail: donorEmail,
            amount,
            currency: 'GBP',
            cause,
            paymentIntentId: (error as any)?.payment_intent?.id,
            errorMessage: error.message,
            errorCode: error.code,
            declineCode: (error as any).decline_code,
          }),
        }).catch(() => {});
      } catch {}

      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const receiptNo = `MITRA-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      trackDonation(amount, cause);
      onSuccess(receiptNo);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#C9B79C] hover:text-[#F4C542] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change details</span>
      </button>

      {/* Amount summary */}
      <div className="bg-[#160B08] border border-[#D4AF37]/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold text-[#F4C542]">Total Payment</span>
          <span className="block text-[11px] text-[#C9B79C] truncate max-w-[200px]">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#F4C542]">£{amount}.00</span>
      </div>

      {/* Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {/* Error message */}
      {paymentError && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="text-[11px] text-[#C9B79C] flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>PCI-DSS Encrypted · Powered by Stripe</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 text-[#0D0705] animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 fill-current text-[#0D0705]" />
            <span>Pay £{amount}.00 Securely</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main DonationModal ────────────────────────────────────────────────────────

export default function DonationModal({
  isOpen,
  onClose,
  initialCategory = 'Annadanam',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: Category;
}) {
  const { user, isLoggedIn, login } = useAuth();

  // ── Guest capture state ──────────────────────────────────────────────────
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>(initialCategory);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  // ── Flow state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // On open: decide starting step based on auth
  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn && user) {
        // Already logged in — pre-fill and go straight to donation details
        if (user.fullName) setDonorName(user.fullName);
        if (user.email) setDonorEmail(user.email);
        setStep('details');
      } else {
        setStep('guest-details');
      }
    }
  }, [isOpen, isLoggedIn]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
      setGuestError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // ── Guest details submit ──────────────────────────────────────────────────
  const handleGuestSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestSubmitting(true);
    setGuestError(null);

    try {
      const res = await fetch('/api/auth/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: guestName.trim(),
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setGuestError(data.error || 'Could not create your account. Please try again.');
        return;
      }

      // Silently log in — update AuthContext
      login(data.user);

      // Pre-fill donation details
      setDonorName(guestName.trim());
      setDonorEmail(guestEmail.trim());

      // Move to the donation details step
      setStep('details');
    } catch {
      setGuestError('Network error. Please check your connection and try again.');
    } finally {
      setGuestSubmitting(false);
    }
  }, [guestName, guestEmail, guestPhone, login]);

  // Load publishable key and initialise Stripe.js once (on first open)
  useEffect(() => {
    if (isOpen && !stripePromise) {
      fetch('/api/payments/get-publishable-key')
        .then((r) => r.json())
        .then((data) => {
          if (data.publishableKey && !data.publishableKey.includes('REPLACE_WITH')) {
            setStripePromise(loadStripe(data.publishableKey));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // ── Derived values — must be above the early return so hook order is stable ──
  const getFinalAmount = useCallback(() => {
    return customAmount ? parseFloat(customAmount) : amount;
  }, [customAmount, amount]);

  const getCauseName = useCallback(() => {
    if (category === 'Annadanam') return 'London Ganesh Mahotsav Annadanam Fund.';
    return 'London Ganesh Mahotsav Event & Cultural Support Seva';
  }, [category]);

  // Step 1: Submit details → create Stripe PaymentIntent
  const handleDetailsSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount < 0.5) return;

    setSubmitting(true);
    setSessionError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          customerName: donorName || 'Devotee Supporter',
          customerEmail: donorEmail,
          description: getCauseName(),
          paymentMethod: 'Stripe Card',
          eventId: 'evt-ganesh-chaturthi',
          eventName: 'London Ganesh Mahotsav 2026',
          donationType: category.toLowerCase().includes('annadanam') ? 'anadanam' : 'event donation',
        }),
      });

      const data = await res.json();

      if (!data.success || !data.clientSecret) {
        setSessionError(data.error || 'Could not initialise payment. Please try again.');
        return;
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch {
      setSessionError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [donorName, donorEmail, getFinalAmount, getCauseName]);

  // Step 2 success callback
  const handlePaymentSuccess = useCallback(
    (receiptNo: string) => {
      const syntheticReceipt: DonationRecord = {
        id: `pay-${Date.now()}`,
        receiptNo,
        donorName: donorName || 'Devotee Supporter',
        donorEmail,
        amount: getFinalAmount(),
        currency: 'GBP',
        cause: getCauseName(),
        paymentMethod: 'Card',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        status: 'Completed',
      };
      setReceipt(syntheticReceipt);
      setStep('success');
    },
    [donorName, donorEmail, getFinalAmount, getCauseName]
  );

  // Stripe Elements appearance — matches the ivory saffron theme
  const stripeAppearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#E65C00',
      colorBackground: '#FFFFFF',
      colorText: '#3D1A00',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      borderRadius: '12px',
    },
    rules: {
      '.Input': { border: '1px solid rgba(230,92,0,0.3)', padding: '10px 14px' },
      '.Input:focus': { border: '1px solid #E65C00', boxShadow: '0 0 0 2px rgba(230,92,0,0.15)' },
      '.Tab': { border: '1px solid rgba(230,92,0,0.2)', backgroundColor: '#FFF0E0' },
      '.Tab--selected': { border: '1px solid #E65C00', backgroundColor: '#FFF0E0' },
      '.Label': { color: '#6B3A2A', fontWeight: '600', fontSize: '11px' },
    },
  };

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="temple-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#E65C00]/30 relative max-h-[90vh] overflow-y-auto"
           style={{ background: '#FFF8F0' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-1 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#3D1A00] font-cinzel">
              Thank You For Your Generosity!
            </h2>
            <p className="text-xs text-[#6B3A2A]">
              Your contribution directly empowers the Telugu community across the United Kingdom.
            </p>

            <div className="bg-[#FFF0E0] p-5 rounded-2xl border border-[#E65C00]/25 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                <span className="text-[#6B3A2A]">Official Receipt No:</span>
                <span className="font-mono font-bold text-[#E65C00]">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Donor Name:</span>
                <span className="font-semibold text-[#3D1A00]">{receipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Amount:</span>
                <span className="font-black text-base text-emerald-600">£{receipt.amount}.00 GBP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Selected Cause:</span>
                <span className="font-semibold text-[#3D1A00] text-right max-w-[200px]">{receipt.cause}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Transaction Date:</span>
                <span className="text-[#3D1A00]">{receipt.date}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B3A2A]">
              A Stripe receipt has been emailed to <strong className="text-[#E65C00]">{receipt.donorEmail}</strong>
            </p>

            <button
              onClick={() => { setReceipt(null); setStep('details'); onClose(); }}
              className="w-full bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold py-3 rounded-xl text-sm transition-all shadow"
            >
              Done / Return to Portal
            </button>
          </div>

        /* ── GUEST DETAILS (not logged in) ─────────────────────────────── */
        ) : step === 'guest-details' ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E65C00]/25 pb-3">
              <div className="p-3 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black font-cinzel gold-foil-text">MAKE A BOOKING</h2>
                <p className="text-xs text-[#6B3A2A]">Quick details — no account needed</p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#6B3A2A] leading-relaxed">
                Enter your details below. We'll create your free MITRA account instantly and email your login credentials — then take you straight to payment.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                <User className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Radhika &amp; Family"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="devotee@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7000 000000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            {/* Guest error */}
            {guestError && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{guestError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your details are kept private · PCI-DSS Encrypted</span>
            </div>

            <button
              type="submit"
              disabled={guestSubmitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guestSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current text-white" />
                  <span>Continue to Booking →</span>
                </>
              )}
            </button>
          </form>

        /* ── STEP 1: DETAILS FORM ──────────────────────────────────────── */
        ) : step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E65C00]/25 pb-3">
              <div className="p-3 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black font-cinzel gold-foil-text">
                  MAKE A BOOKING
                </h2>
                <p className="text-xs text-[#6B3A2A]">
                  MITRA UK &amp; Mahotsav Seva Contributions
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider mb-2">
                Event category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'Annadanam' as Category, label: 'Annadanam Seva', icon: <Utensils className="w-4 h-4 text-[#E65C00]" />, desc: 'Sponsor Mahaprasadam food distribution' },
                    { key: 'Event Donations' as Category, label: 'Event Seva', icon: <Calendar className="w-4 h-4 text-[#E65C00]" />, desc: 'For Idol Purchase, Puja Samagri, Flower Decor, Fruits' },
                  ] as Array<{ key: Category; label: string; icon: React.ReactNode; desc: string }>
                ).map(({ key, label, icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-start gap-1 relative text-left ${
                      category === key
                        ? 'bg-[#FFF0E0] text-[#E65C00] border-[#E65C00] shadow-md ring-1 ring-[#E65C00]'
                        : 'bg-white text-[#6B3A2A] border-[#E65C00]/20 hover:border-[#E65C00]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-cinzel font-black">
                      {icon}
                      <span className={category === key ? 'text-[#E65C00]' : 'text-[#3D1A00]'}>{label}</span>
                    </div>
                    <p className="text-[10px] text-[#6B3A2A] leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-[#6B3A2A] mb-2">
                Select amount (GBP £ · Min £1)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[21, 51, 108, 251].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                      amount === amt && !customAmount
                        ? 'bg-[#FFF0E0] text-[#E65C00] border-[#E65C00]'
                        : 'bg-white text-[#6B3A2A] border-[#E65C00]/20 hover:border-[#E65C00]'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                placeholder="Or enter any custom amount above £1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>

            {/* Donor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#6B3A2A] mb-1">
                  Full Name / Gotram
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika &amp; Family"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B3A2A] mb-1">
                  Email Address for Receipt
                </label>
                <input
                  type="email"
                  required
                  placeholder="devotee@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            {/* Session error */}
            {sessionError && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{sessionError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Encrypted · Powered by Stripe</span>
            </div>

            <button
              type="submit"
              disabled={submitting || !getFinalAmount() || getFinalAmount() <= 0}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Preparing Secure Payment...</span>
                </>
              ) : getFinalAmount() && getFinalAmount() > 0 ? (
                <>
                  <Heart className="w-4 h-4 fill-current text-white" />
                  <span>
                    Proceed to Pay £{getFinalAmount()}.00
                  </span>
                </>
              ) : (
                <span>Please enter amount</span>
              )}
            </button>
          </form>

        /* ── STEP 2: STRIPE PAYMENT ELEMENT ────────────────────────────── */
        ) : step === 'payment' && clientSecret && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: stripeAppearance,
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              amount={getFinalAmount()}
              donorName={donorName || 'Devotee Supporter'}
              donorEmail={donorEmail}
              cause={getCauseName()}
              onSuccess={handlePaymentSuccess}
              onBack={() => { setStep('details'); setClientSecret(null); }}
            />
          </Elements>
        ) : (
          /* Fallback: Stripe not configured */
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-black text-[#E65C00]">Stripe Not Configured</h3>
            <p className="text-xs text-[#6B3A2A]">
              Please add your Stripe API keys in{' '}
              <strong className="text-[#E65C00]">Admin → Payments → Stripe Account Config</strong>, then restart the server.
            </p>
            <button
              onClick={onClose}
              className="text-xs text-[#6B3A2A] hover:text-[#E65C00] underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
