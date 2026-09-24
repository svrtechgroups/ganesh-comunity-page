'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Calendar, MapPin, Flame, Award } from 'lucide-react';

interface RitualCountdownProps {
  targetDate?: string;
  eventTitle?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export default function RitualCountdown({
  targetDate: propTargetDate,
  eventTitle = 'London Ganesh Mahotsav',
  primaryColor = '#E65C00',
  accentColor = '#CC4000',
  backgroundColor = '#FFF0E0',
}: RitualCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [arrived, setArrived] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const targetTimestamp = propTargetDate
    ? new Date(propTargetDate).getTime()
    : new Date('2026-09-14T00:00:00.000Z').getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setArrived(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [targetTimestamp]);

  const triggerSparks = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E65C00', '#FF7A00', '#FF9A3C', '#7A1620'],
    });
  };

  return (
    <>
      {/* Sticky Mini Countdown Chip */}
      {showSticky && (
        <div
          className="fixed top-30 right-6 z-40 bg-white/95 px-4 py-2 rounded-full shadow-xl backdrop-blur flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border"
          style={{ borderColor: `${primaryColor}60` }}
        >
          <Flame className="w-4 h-4 animate-flame" style={{ color: primaryColor }} />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            <span className="font-black" style={{ color: primaryColor }}>
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>{' '}
            until {eventTitle}
          </span>
          <a
            href="#ritual-clock"
            className="text-[10px] text-white px-2.5 py-1 rounded-full font-extrabold uppercase transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Clock
          </a>
        </div>
      )}

      {/* Main Ritual Clock Section */}
      <section
        id="ritual-clock"
        className="relative py-20 border-y overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: backgroundColor,
          borderColor: `${primaryColor}30`,
          color: '#3D1A00',
        }}
      >
        {/* Background dot pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${primaryColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: `${primaryColor}40`,
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: primaryColor }}
              >
                THE OFFICIAL EVENT COUNTDOWN
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-wider text-slate-900 dark:text-white uppercase">
              {arrived ? `${eventTitle} IS HAPPENING NOW!` : `COUNTDOWN TO ${eventTitle}`}
            </h2>
          </div>

          {/* 4 Countdown Dials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: timeLeft.hours },
              { label: 'MINUTES', value: timeLeft.minutes },
              { label: 'SECONDS', value: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="temple-card temple-card-hover p-6 rounded-3xl flex flex-col items-center justify-center relative group border border-[#E65C00]/25"
                onClick={triggerSparks}
              >
                {/* Flame Flicker Element */}
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-gradient-to-t from-[#E65C00] to-[#FF9A3C] flex items-center justify-center animate-flame shadow-[0_0_12px_rgba(230,92,0,0.6)]">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </div>

                {/* Circular Frame */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#E65C00]/40 flex flex-col items-center justify-center bg-[#FFF8F0] shadow-inner group-hover:border-[#E65C00] transition-colors relative">
                  <span className="text-3xl sm:text-4xl font-black font-cinzel gold-foil-text tracking-tighter">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>

                <span className="mt-4 text-xs font-black tracking-widest text-[#6B3A2A] group-hover:text-[#E65C00] transition-colors uppercase">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
