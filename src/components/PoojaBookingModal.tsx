'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { trackDonation } from '@/lib/analytics';
import {
  Flame,
  CheckCircle2,
  Lock,
  X,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Phone,
  Mail,
  User,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationRecord, EventItem } from '@/lib/types';
import { getEventSchedule } from '@/lib/event-schedule';
import { useAuth } from '@/lib/auth-context';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ── Sacred Pooja & Archana Categories ────────────────────────────────────────

export interface PoojaCategoryOption {
  id: string;
  name: string;
  type: 'pooja' | 'archana';
  amount: number;
  badge?: string;
  tagline: string;
  description: string;
  inclusions: string;
  disabled?: boolean;
}

export const POOJA_CATEGORIES: PoojaCategoryOption[] = [
  // Pooja Categories
  {
    id: 'maha-yajaman',
    name: 'Maha Yajaman',
    type: 'pooja',
    amount: 316,
    badge: 'BOOKINGS CLOSED',
    tagline: 'Grand Sanctum Seva & Full Family Sankalpam',
    description: 'Lead the sacred ritual alongside Head Vedic Priests. Includes full family Sankalpam, VIP sanctum Darshan privileges, and Consecrated Maha Prasadam box.',
    inclusions: 'Full Family Gotram & Nakshatram Sankalpam, Sanctum Seva, VIP Darshan, Consecrated Maha Prasadam & Vastram kit',
    disabled: true,
  },
  {
    id: 'vishita-yajaman',
    name: 'Vishita Yajaman',
    type: 'pooja',
    amount: 116,
    badge: 'MOST POPULAR',
    tagline: 'Special Yajamani Pooja & Sankalpam',
    description: 'Personalized family Sankalpam by Vedic Priests during sacred Abhishekams and Arati, with consecrated Prasadam box.',
    inclusions: 'Personalized Family Gotram & Nakshatram Sankalpam, Aarti Sanctum Darshan, Consecrated Festival Prasadam box'
  },
  {
    id: 'yajaman',
    name: 'Yajaman',
    type: 'pooja',
    amount: 51,
    tagline: 'Devotee Sankalpam & Consecrated Prasadam',
    description: 'Devotee Sankalpam with Gotram and Family Names recited during the chosen day’s Maha Pooja, plus sacred Prasadam.',
    inclusions: 'Devotee Name & Gotram recited in daily Sankalpam, Consecrated Prasadam, Virtual Darshan access'
  },
  // Archana
  {
    id: 'daily-archana-7days',
    name: '7 Days Daily Archana',
    type: 'archana',
    amount: 21,
    badge: 'ALL 7 DAYS',
    tagline: 'Continuous Daily Vedic Archana across all 7 Days',
    description: 'Consecrated Ashtothara Sathanama Archana chanted daily across all 7 days of the Mahotsav in your family name for auspiciousness, health, and removal of obstacles.',
    inclusions: 'Daily Vedic Archana for all 7 Days in family name, Sanctified Kumkuma & Prasadam blessings'
  }
];

// ── 7 Sacred Pooja Days ──────────────────────────────────────────────────────

export interface PoojaDateOption {
  id: string;
  date: string;
  day: string;
  title: string;
  theme: string;
  blessing: string;
  badge?: string;
}

export const POOJA_DATES: PoojaDateOption[] = [
  // {
  //   id: 'day-1',
  //   date: '13th Sep',
  //   day: 'Sunday',
  //   title: 'Ganapathi Agamana',
  //   theme: 'Ganapathi Agamana & Mandapam Preparation',
  //   blessing: 'Divine Welcome, Sanctum Purification & Auspicious Beginnings',
  //   badge: 'DAY 1'
  // },
  {
    id: 'day-1',
    date: '14th Sep',
    day: 'Monday',
    title: 'Maha Ganapati Prathista',
    theme: 'Ganesh Chaturthi The Grand Beginning',
    blessing: 'Prana Pratishtha, Sacred Maha Sankalpam & Grand Illumination',
    badge: 'GRAND CHATURTHI'
  },
  {
    id: 'day-2',
    date: '15th Sep',
    day: 'Tuesday',
    title: 'Vidya Ganapati',
    theme: 'For Wisdom, Education, Knowledge & Learning',
    blessing: 'Academic Success, Mental Clarity, Intellect & Saraswati Kataksham',
  },
  {
    id: 'day-3',
    date: '16th Sep',
    day: 'Wednesday',
    title: 'Arogya Ganapati',
    theme: 'For Radiant Health, Healing & Wellbeing',
    blessing: 'Ayushya Abhivrudhi, Vitality, Radiant Health & Disease Protection',
  },
  {
    id: 'day-4',
    date: '17th Sep',
    day: 'Thursday',
    title: 'Lakshmi Ganapati',
    theme: 'For Prosperity, Abundance & Success',
    blessing: 'Financial Growth, Business Auspiciousness & Abundance',
  },
  {
    id: 'day-5',
    date: '18th Sep',
    day: 'Friday',
    title: 'Korikala Ganapati',
    theme: 'For Wishes, Aspirations & Fulfillment',
    blessing: 'Sankalpa Siddhi, Career Milestones & Desire Fulfillment',
  },
  {
    id: 'day-6',
    date: '19th Sep',
    day: 'Saturday',
    title: 'Bhakti Ganapati',
    theme: 'For Devotion, Peace & Spiritual Strength',
    blessing: 'Inner Serenity, Family Harmony & Spiritual Elevation',
  },
  {
    id: 'day-7',
    date: '20th Sep',
    day: 'Sunday',
    title: 'Utsava Ganapati & Nimajjanam',
    theme: 'Celebration, Gratitude, Maha Visarjan & Farewell to Bappa',
    blessing: 'Maha Visarjan Blessings, Victory & Eternal Divine Grace',
    badge: 'MAHA VISARJAN'
  }
];

export interface PoojaDateStatus {
  disabled: boolean;
  reason?: 'past' | 'visarjan' | 'booked';
  statusLabel?: string;
}

export function getPoojaDateStatus(
  dateStr: string,
  currentBookingCount: number = 0,
  itemBadge?: string
): PoojaDateStatus {
  // 1. Explicitly closed or completed badge
  if (itemBadge && (itemBadge.toUpperCase().includes('CLOSED') || itemBadge.toUpperCase().includes('COMPLETED'))) {
    return {
      disabled: true,
      reason: 'visarjan',
      statusLabel: itemBadge.toUpperCase(),
    };
  }

  // 2. Disable past dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (8 = September)
  const currentDay = now.getDate();

  let isPast = false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    isPast = dateObj < new Date(currentYear, currentMonth, currentDay);
  } else {
    const dayMatch = dateStr.match(/\b(\d{1,2})\b/);
    const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : NaN;

    if (currentYear > 2026) {
      isPast = true;
    } else if (currentYear === 2026) {
      if (currentMonth > 8) {
        isPast = true;
      } else if (currentMonth === 8 && !isNaN(dayNum) && dayNum < currentDay) {
        isPast = true;
      }
    }
  }

  if (isPast) {
    return {
      disabled: true,
      reason: 'past',
      statusLabel: 'DATE PASSED',
    };
  }

  // 3. Fully booked (limit 10)
  if (currentBookingCount >= 10) {
    return {
      disabled: true,
      reason: 'booked',
      statusLabel: 'FULLY BOOKED',
    };
  }

  return { disabled: false };
}

type Step = 'guest-details' | 'details' | 'payment' | 'success';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  devoteeName: string;
  devoteeEmail: string;
  cause: string;
  onSuccess: (receiptId: string) => void;
  onBack: () => void;
}

// ── Inner Stripe Checkout Form ────────────────────────────────────────────────

function CheckoutForm({
  clientSecret,
  amount,
  devoteeName,
  devoteeEmail,
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

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/ganesh-event-2026?payment=success`
          : 'https://mitra.org.uk/ganesh-event-2026?payment=success',
        payment_method_data: {
          billing_details: {
            name: devoteeName,
            email: devoteeEmail,
          },
        },
      },
      redirect: 'if_required',
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
            customerName: devoteeName,
            customerEmail: devoteeEmail,
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
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      const receiptNo = `MITRA-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      trackDonation(amount, cause);
      onSuccess(receiptNo);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change booking details</span>
      </button>

      <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5 max-w-[220px]">
          <span className="block text-xs font-bold text-[#E65C00]">Pooja Seva Booking</span>
          <span className="block text-[11px] text-[#6B3A2A] truncate">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#E65C00]">£{amount}.00</span>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {paymentError && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5 font-semibold">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>PCI-DSS Encrypted · Powered by Stripe</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Confirming Sacred Booking...</span>
          </>
        ) : (
          <>
            <Flame className="w-4 h-4 fill-current text-white" />
            <span>Complete Pooja Seva (£{amount}.00)</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main PoojaBookingModal ────────────────────────────────────────────────────

export interface PoojaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventItem | null;
  eventId?: string;
  initialDateId?: string;
  initialCategoryId?: string;
  customDates?: PoojaDateOption[];
}

export default function PoojaBookingModal({
  isOpen,
  onClose,
  event,
  eventId,
  initialDateId,
  initialCategoryId,
  customDates,
}: PoojaBookingModalProps) {
  const { user, isLoggedIn, login } = useAuth();

  const [activeEvent, setActiveEvent] = useState<EventItem | null>(event || null);

  useEffect(() => {
    if (event) {
      setActiveEvent(event);
    }
  }, [event]);

  // Fetch event and its configured schedule from database when opened if not provided
  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setActiveEvent(event);
      return;
    }

    let isMounted = true;
    const fetchEventSchedule = async () => {
      try {
        const url = eventId ? `/api/events?id=${encodeURIComponent(eventId)}` : '/api/events';
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!isMounted) return;

        if (json.success) {
          if (eventId && json.data && !Array.isArray(json.data)) {
            setActiveEvent(json.data);
          } else if (Array.isArray(json.data)) {
            const matched = eventId
              ? json.data.find((e: any) => e.id === eventId)
              : json.data.find(
                  (e: any) =>
                    e.id === 'evt-ganesh-chaturthi' ||
                    e.title?.toLowerCase().includes('ganesh') ||
                    e.enablePooja
                ) || json.data[0];
            if (matched) {
              setActiveEvent(matched);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch event dates from DB for PoojaBookingModal:', err);
      }
    };

    fetchEventSchedule();
    return () => {
      isMounted = false;
    };
  }, [isOpen, event, eventId]);

  // Derive pooja dates dynamically from DB eventSchedule or fallback
  const poojaDates: PoojaDateOption[] = React.useMemo(() => {
    if (customDates && customDates.length > 0) {
      return customDates;
    }
    const schedule = getEventSchedule(activeEvent);
    if (schedule && schedule.length > 0) {
      return schedule.map((s, idx) => ({
        id: s.id || `day-${idx + 1}`,
        date: s.date || `Day ${idx + 1}`,
        day: s.day || '',
        title: s.title || `Day ${idx + 1}`,
        theme: s.theme || '',
        blessing: s.blessing || s.theme || '',
        badge: s.badge,
      }));
    }
    return POOJA_DATES;
  }, [customDates, activeEvent]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId && initialCategoryId !== 'maha-yajaman' ? initialCategoryId : 'vishita-yajaman'
  );
  const [selectedDateId, setSelectedDateId] = useState<string>(initialDateId || 'day-1');
  const [devoteeName, setDevoteeName] = useState('');
  const [gotram, setGotram] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialWishes, setSpecialWishes] = useState('');

  // ── Guest capture state ──────────────────────────────────────────────────
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/booking-counts', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.counts) {
        setDbCounts(data.counts);
      }
    } catch (e) {
      console.error('Error fetching booking counts:', e);
    }
  }, []);

  const getBookingCount = useCallback((dateStr: string) => {
    return dbCounts[dateStr] || 0;
  }, [dbCounts]);

  // Sync initial category or date if passed (ensuring maha-yajaman cannot be selected)
  useEffect(() => {
    if (initialCategoryId && initialCategoryId !== 'maha-yajaman') {
      setSelectedCategoryId(initialCategoryId);
    } else if (initialCategoryId === 'maha-yajaman') {
      setSelectedCategoryId('vishita-yajaman');
    }
  }, [initialCategoryId]);

  useEffect(() => {
    if (initialDateId && poojaDates.some(d => d.id === initialDateId)) {
      const targetDate = poojaDates.find(d => d.id === initialDateId);
      if (targetDate) {
        const status = getPoojaDateStatus(targetDate.date, getBookingCount(targetDate.date), targetDate.badge);
        if (!status.disabled) {
          setSelectedDateId(initialDateId);
        }
      }
    }
  }, [initialDateId, poojaDates, getBookingCount]);

  // Auto-select first available date if selected one is past, closed, or fully booked
  useEffect(() => {
    if (isOpen && poojaDates.length > 0) {
      const currentSelectedDate = poojaDates.find(d => d.id === selectedDateId);
      const count = currentSelectedDate ? getBookingCount(currentSelectedDate.date) : 0;
      const status = currentSelectedDate
        ? getPoojaDateStatus(currentSelectedDate.date, count, currentSelectedDate.badge)
        : { disabled: true };

      if (status.disabled) {
        const availableDate = poojaDates.find(
          d => !getPoojaDateStatus(d.date, getBookingCount(d.date), d.badge).disabled
        );
        if (availableDate) {
          setSelectedDateId(availableDate.id);
        } else if (!currentSelectedDate) {
          setSelectedDateId(poojaDates[0].id);
        }
      }
    }
  }, [isOpen, dbCounts, selectedDateId, poojaDates, getBookingCount]);

  useEffect(() => {
    if (isOpen) {
      fetchCounts();
    }
  }, [isOpen, fetchCounts]);

  // On open: decide starting step based on auth
  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn && user) {
        if (user.fullName) setDevoteeName(user.fullName);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);
        setStep('details');
      } else {
        setStep('guest-details');
      }
    }
  }, [isOpen, isLoggedIn]);

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
      setGuestError(null);
    }
  }, [isOpen]);

  // Initialise Stripe publishable key
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

      // Silently log in
      login(data.user);

      // Pre-fill devotee details
      setDevoteeName(guestName.trim());
      setEmail(guestEmail.trim());
      setPhone(guestPhone.trim());

      // Move to pooja booking details
      setStep('details');
    } catch {
      setGuestError('Network error. Please check your connection and try again.');
    } finally {
      setGuestSubmitting(false);
    }
  }, [guestName, guestEmail, guestPhone, login]);

  const selectedCategory = POOJA_CATEGORIES.find((c) => c.id === selectedCategoryId) || POOJA_CATEGORIES[1];
  const isArchana = selectedCategory.type === 'archana';
  const selectedDateObj = poojaDates.find((d) => d.id === selectedDateId) || poojaDates[0] || POOJA_DATES[0];
  const poojaAmount = selectedCategory.amount;

  const getCauseDescription = useCallback(() => {
    let desc = isArchana
      ? `Archana Booking: ${poojaDates.length} Days Daily Archana (£21) - All ${poojaDates.length} Festival Days | Devotee: ${devoteeName}`
      : `Pooja Booking: ${selectedCategory.name} (£${selectedCategory.amount}) - ${selectedDateObj.date} (${selectedDateObj.title}) | Devotee: ${devoteeName}`;
    if (gotram) desc += ` | Gotram: ${gotram}`;
    if (familyMembers) desc += ` | Priest Sankalpam: ${familyMembers}`;
    return desc;
  }, [isArchana, poojaDates, selectedCategory, selectedDateObj, gotram, devoteeName, familyMembers]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !email) return;

    // Check if category is disabled (e.g. Maha Yajaman)
    if (selectedCategory.disabled || selectedCategory.id === 'maha-yajaman') {
      setSessionError('Maha Yajaman seva bookings are currently closed. Please choose another category.');
      return;
    }

    // Double check limit and date availability before proceeding to pay
    if (!isArchana) {
      const count = getBookingCount(selectedDateObj.date);
      const dateStatus = getPoojaDateStatus(selectedDateObj.date, count, selectedDateObj.badge);
      if (dateStatus.disabled) {
        if (dateStatus.reason === 'past') {
          setSessionError(`Sorry, ${selectedDateObj.date} has already passed. Please choose an upcoming date.`);
        } else if (dateStatus.reason === 'visarjan') {
          setSessionError(`Pooja bookings are closed on ${selectedDateObj.date}.`);
        } else {
          setSessionError(`Sorry, ${selectedDateObj.date} is now fully booked. Please choose another date.`);
        }
        return;
      }
    }

    setSubmitting(true);
    setSessionError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: poojaAmount,
          customerName: devoteeName,
          customerEmail: email,
          customerPhone: phone,
          description: getCauseDescription(),
          paymentMethod: 'Stripe Card',
          eventId: activeEvent?.id || 'evt-ganesh-chaturthi',
          eventName: activeEvent?.title || 'London Ganesh Mahotsav 2026',
          donationType: isArchana ? 'archana' : 'pooja',
          poojaCategory: selectedCategory.name,
          poojaDate: isArchana
            ? `All ${poojaDates.length} Days (${poojaDates[0]?.date || ''} - ${poojaDates[poojaDates.length - 1]?.date || ''})`
            : selectedDateObj.date,
          poojaDay: isArchana ? 'Full Festival' : selectedDateObj.day,
          poojaTitle: isArchana ? `${poojaDates.length} Days Daily Archana` : selectedDateObj.title,
          gotram: gotram ? gotram.trim() : null,
          familyMembers: familyMembers ? familyMembers.trim() : null,
          specialWishes: specialWishes ? specialWishes.trim() : null,
          primaryDevoteeName: devoteeName ? devoteeName.trim() : null,
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
  };

  const handlePaymentSuccess = (receiptNo: string) => {
    const syntheticReceipt: DonationRecord = {
      id: `pooja-${Date.now()}`,
      receiptNo,
      donorName: devoteeName,
      donorEmail: email,
      amount: poojaAmount,
      currency: 'GBP',
      cause: isArchana
        ? `${poojaDates.length} Days Daily Archana (£21)`
        : `${selectedCategory.name} (£${selectedCategory.amount}) - ${selectedDateObj.date} ${selectedDateObj.title}`,
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
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="temple-card rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-xl border-2 border-[#E65C00]/30 relative max-h-[92vh] overflow-y-auto"
        style={{ background: '#FFF8F0' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#3D1A00] font-cinzel">
              Pooja Seva Confirmed!
            </h2>
            <p className="text-xs text-[#6B3A2A]">
              May Lord Ganesha shower your family with health, wealth, and obstacles removal.
            </p>

            <div className="bg-[#FFF0E0] p-5 rounded-2xl border border-[#E65C00]/25 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                <span className="text-[#6B3A2A]">Pooja Booking Receipt:</span>
                <span className="font-mono font-bold text-[#E65C00]">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Seva Category:</span>
                <span className="font-black text-[#E65C00] bg-white px-2 py-0.5 rounded-md border border-[#E65C00]/20">
                  {selectedCategory.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Timing / Day:</span>
                <span className="font-bold text-[#3D1A00]">
                  {isArchana ? 'All 7 Days (14th – 20th Sep)' : `${selectedDateObj.date} (${selectedDateObj.day})`}
                </span>
              </div>
              {!isArchana && (
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Ritual Deity:</span>
                  <span className="font-semibold text-[#3D1A00]">{selectedDateObj.title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Devotee / Yajamani:</span>
                <span className="font-semibold text-[#3D1A00]">{receipt.donorName}</span>
              </div>
              {gotram && (
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Gotram:</span>
                  <span className="font-semibold text-[#3D1A00]">{gotram}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E65C00]/15 pt-2">
                <span className="text-[#6B3A2A]">Total Seva Paid:</span>
                <span className="font-black text-base text-emerald-600">£{receipt.amount}.00 GBP</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B3A2A]">
              A confirmation email with virtual Darshan details has been sent to{' '}
              <strong className="text-[#E65C00]">{receipt.donorEmail}</strong>
            </p>

            <button
              onClick={() => { setReceipt(null); setStep('details'); onClose(); }}
              className="w-full bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold py-3 rounded-xl text-sm transition-all"
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
                <Flame className="w-6 h-6 fill-current text-[#E65C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-cinzel gold-foil-text">SACRED POOJA &amp; ARCHANA</h2>
                  {/* <span className="bg-[#E65C00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">£{selectedCategory.amount} SEVA</span> */}
                </div>
                <p className="text-xs text-[#6B3A2A]">Quick details — no account needed</p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#6B3A2A] leading-relaxed">
                Enter your details below. We'll create your free MITRA account instantly and email your login credentials — then take you straight to your Pooja booking.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                <User className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Full Name / Yajamani Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Kumar"
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
                  <Flame className="w-4 h-4 fill-current text-white" />
                  <span>Continue to Pooja Booking →</span>
                </>
              )}
            </button>
          </form>

        /* ── STEP 1: POOJA DETAILS FORM ─────────────────────────────────── */
        ) : step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E65C00]/25 pb-3">
              <div className="p-3 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                <Flame className="w-6 h-6 fill-current text-[#E65C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-cinzel text-[#3D1A00]">
                    SACRED POOJA &amp; ARCHANA
                  </h2>
                  {/* <span className="bg-[#E65C00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    £{selectedCategory.amount} SEVA
                  </span> */}
                </div>
                <p className="text-xs text-[#6B3A2A]">
                  London Ganesh Mahotsav 2026 · Slough Langley
                </p>
              </div>
            </div>

            {/* 1. Category Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider flex items-center gap-1.5 font-cinzel">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Choose Pooja Category / Archana</span>
                </label>
                <span className="text-[10px] text-[#6B3A2A] font-semibold">Select your Seva</span>
              </div>

              {/* Pooja Categories */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-black text-[#6B3A2A] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#E65C00]" />
                  <span>Pooja Categories</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {POOJA_CATEGORIES.filter((c) => c.type === 'pooja').map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const isDisabled = !!cat.disabled;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedCategoryId(cat.id)}
                        className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                          isDisabled
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white border-[#E65C00] shadow-md ring-2 ring-[#E65C00]/30'
                            : 'bg-white hover:bg-[#FFF8F0] border-[#E65C00]/25 hover:border-[#E65C00]'
                        }`}
                      >
                        {cat.badge && (
                          <span className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                            isDisabled
                              ? 'bg-red-600 text-white'
                              : isSelected
                              ? 'bg-white text-[#E65C00]'
                              : 'bg-[#E65C00]/10 text-[#E65C00]'
                          }`}>
                            {cat.badge}
                          </span>
                        )}
                        <div>
                          <div className={`text-base font-black font-cinzel ${isDisabled ? 'text-slate-400' : isSelected ? 'text-white' : 'text-[#E65C00]'}`}>
                            £{cat.amount}
                          </div>
                          <h4 className={`text-xs font-bold mt-0.5 ${isDisabled ? 'text-slate-500' : isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                            {cat.name}
                          </h4>
                          <p className={`text-[10px] line-clamp-2 mt-1 leading-tight ${isDisabled ? 'text-slate-400' : isSelected ? 'text-white/90' : 'text-[#6B3A2A]'}`}>
                            {isDisabled ? 'Seva bookings currently closed.' : cat.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Archana */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-black text-[#6B3A2A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#E65C00]" />
                  <span>Archana</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {POOJA_CATEGORIES.filter((c) => c.type === 'archana').map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`p-3 rounded-2xl text-left transition-all border relative flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white border-[#E65C00] shadow-md ring-2 ring-[#E65C00]/30'
                            : 'bg-white hover:bg-[#FFF8F0] border-[#E65C00]/25 hover:border-[#E65C00]'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                              {cat.name}
                            </h4>
                            {cat.badge && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                isSelected ? 'bg-white text-[#E65C00]' : 'bg-[#E65C00]/10 text-[#E65C00]'
                              }`}>
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] leading-tight ${isSelected ? 'text-white/90' : 'text-[#6B3A2A]'}`}>
                            {cat.tagline}
                          </p>
                        </div>
                        <div className={`text-base font-black font-cinzel shrink-0 ${isSelected ? 'text-white' : 'text-[#E65C00]'}`}>
                          £{cat.amount}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider flex items-center gap-1.5 font-cinzel">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>2. Festival Timing &amp; Date</span>
                </label>
                <span className="text-[10px] text-[#6B3A2A] font-semibold">
                  {isArchana ? `All ${poojaDates.length} Days Included` : `${poojaDates.length} Sacred Festival Days`}
                </span>
              </div>

              {isArchana ? (
                <div className="bg-[#FFF0E0] border border-[#E65C00]/30 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#3D1A00]">
                      {poojaDates.length} Days Continuous Daily Archana ({poojaDates[0]?.date || '14th Sep'} – {poojaDates[poojaDates.length - 1]?.date || '20th Sep 2026'})
                    </h4>
                    <p className="text-[11px] text-[#6B3A2A] leading-relaxed">
                      Your family Gotram and names will be invoked daily in the Vedic Ashtothara Sathanama Archana across all {poojaDates.length} days of the Mahotsav.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {poojaDates.map((item) => {
                    const isSelected = selectedDateId === item.id;
                    const count = getBookingCount(item.date);
                    const status = getPoojaDateStatus(item.date, count, item.badge);
                    const isDisabled = status.disabled;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedDateId(item.id)}
                        className={`p-2.5 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                          isDisabled
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] border-[#E65C00] shadow-md ring-1 ring-[#E65C00]'
                            : 'bg-white hover:bg-[#FFF8F0] border-[#E65C00]/20 hover:border-[#E65C00]'
                        }`}
                      >
                        {status.disabled ? (
                          <span className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase text-white ${
                            status.reason === 'past'
                              ? 'bg-slate-500'
                              : status.reason === 'visarjan'
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}>
                            {status.statusLabel}
                          </span>
                        ) : item.badge ? (
                          <span className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                            isSelected ? 'bg-white text-[#E65C00]' : 'bg-[#E65C00] text-white'
                          }`}>
                            {item.badge}
                          </span>
                        ) : (
                          <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#E65C00]/10 text-[#E65C00]'
                          }`}>
                            {Math.max(0, 10 - count)} slots left
                          </span>
                        )}
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-xs font-black font-cinzel ${isDisabled ? 'text-slate-400 line-through' : isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                              {item.date}
                            </span>
                            {item.day && (
                              <span className={`text-[10px] font-medium ${isDisabled ? 'text-slate-400' : 'text-[#6B3A2A]'}`}>
                                ({item.day})
                              </span>
                            )}
                          </div>
                          <h4 className={`text-xs font-bold mt-0.5 leading-snug ${isDisabled ? 'text-slate-400' : isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#6B3A2A] line-clamp-1 mt-0.5">
                            {isDisabled
                              ? status.reason === 'past'
                                ? 'Date Passed'
                                : status.reason === 'visarjan'
                                ? 'Bookings Closed'
                                : 'Fully Booked'
                              : item.theme || item.blessing}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Devotee Details */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider flex items-center gap-1.5 font-cinzel">
                <User className="w-3.5 h-3.5" />
                <span>3. Sankalpam &amp; Devotee Information</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1">
                    Primary Devotee / Yajamani Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1">
                    Family Gotram (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kasyapa, Bharadwaja"
                    value={gotram}
                    onChange={(e) => setGotram(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#E65C00]" />
                  <span>Family Member Names &amp; Nakshatrams for Priest Sankalpam (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya (Rohini), Aryan (Revathi)"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#E65C00]" />
                    <span>Email Address (for Receipt) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#E65C00]" />
                    <span>Phone / WhatsApp (for Updates) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>
            </div>

            {/* Selected Summary & Inclusions */}
            <div className="bg-[#FFF0E0] p-3 rounded-xl border border-[#E65C00]/25 text-[11px] text-[#6B3A2A] space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#E65C00] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedCategory.name} Seva Includes:</span>
                </div>
                <span className="text-xs font-black text-[#E65C00] font-cinzel shrink-0">£{selectedCategory.amount}.00</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                {selectedCategory.inclusions}
              </p>
            </div>

            {/* Session Error */}
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
              disabled={submitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Preparing Secure Payment...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-current text-white" />
                  <span>
                    Proceed to Pay £{selectedCategory.amount} for {selectedCategory.name}
                    {!isArchana ? ` (${selectedDateObj.date})` : ''}
                  </span>
                </>
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
              amount={poojaAmount}
              devoteeName={devoteeName}
              devoteeEmail={email}
              cause={
                isArchana
                  ? `7 Days Daily Archana (£21)`
                  : `${selectedCategory.name} (£${selectedCategory.amount}) - ${selectedDateObj.date} ${selectedDateObj.title}`
              }
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
