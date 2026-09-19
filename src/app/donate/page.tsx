'use client';

import { useState } from 'react';
import DonationModal from '@/components/DonationModal';
import { Heart, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function DonatePage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="space-y-3">
        <span className="bg-mitra-red/10 text-mitra-red dark:bg-mitra-gold/10 dark:text-mitra-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Support MITRA Charity Fund
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Make a Difference in Our Community
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Your contributions support student emergency welfare, repatriation assistance, and preserving Telugu cultural heritage across the UK.
        </p>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-mitra-red hover:bg-mitra-red-dark text-white font-extrabold px-8 py-4 rounded-2xl text-sm shadow-xl transition-all inline-flex items-center gap-2"
      >
        <Heart className="w-5 h-5 fill-white" />
        <span>Make a Booking</span>
      </button>

      <DonationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
