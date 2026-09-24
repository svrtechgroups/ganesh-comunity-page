'use client';

import { ScrollText } from 'lucide-react';

interface StorySectionProps {
  story?: {
    badge?: string;
    quote?: string;
    description?: string;
    stats?: { value: string; label: string }[];
  };
  bannerImageUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export default function StorySection({
  story,
  bannerImageUrl = '/assets/poster.jpg',
  primaryColor = '#E65C00',
  accentColor = '#CC4000',
  backgroundColor = '#FFF8F0',
}: StorySectionProps) {
  const badge = story?.badge || 'THE DEVOTIONAL JOURNEY';
  const quote =
    story?.quote ||
    '“From Lalbaugcha Raja in Mumbai to Khairatabad Ganesh in Hyderabad… now London\'s own iconic Ganesha arrives in Slough.”';
  const description =
    story?.description ||
    'Organized by MITRA UK in association with ELE Entertainments and presented by Biryanis and more!, the Maha Ganapathi Mahotsav represents a historic cultural milestone for the UK diaspora. Step into the sanctum, offer your prayers, and experience the divine presence of Bappa in Great Britain.';
  const stats = story?.stats || [
    { value: '5,000+', label: 'Expected Devotees' },
    { value: '100%', label: 'Eco-Friendly Clay Murti' },
    { value: 'Grand Aarti', label: 'Daily Mahaprasadam' },
  ];

  return (
    <section
      className="relative py-24 text-[#3D1A00] overflow-hidden border-b transition-colors duration-300"
      style={{
        backgroundColor: backgroundColor,
        borderColor: `${primaryColor}40`,
      }}
    >
      {/* Background Image Accent */}
      <div
        className="absolute inset-0 z-0 opacity-10 bg-cover bg-center filter contrast-125 pointer-events-none"
        style={{ backgroundImage: `url('${bannerImageUrl}')` }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${backgroundColor}, ${backgroundColor}DD, ${backgroundColor})`,
        }}
      />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm border"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}40`,
            color: primaryColor,
          }}
        >
          <ScrollText className="w-4 h-4" />
          <span>{badge}</span>
        </div>

        <blockquote className="text-2xl sm:text-4xl font-bold font-cinzel gold-foil-text leading-relaxed tracking-wide italic">
          {quote}
        </blockquote>

        <div
          className="w-24 h-1 mx-auto"
          style={{
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
          }}
        />

        <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
          {description}
        </p>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="temple-card bg-white dark:bg-slate-900 p-5 rounded-2xl border space-y-1 shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <span
                  className="text-2xl font-black font-cinzel block"
                  style={{ color: primaryColor }}
                >
                  {stat.value}
                </span>
                <span className="text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
