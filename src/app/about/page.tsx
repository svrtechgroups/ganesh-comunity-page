'use client';

import { constructMetadata } from '@/lib/seo-config';
import Link from 'next/link';
import { Download, ShieldCheck, Heart, Users, Award, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-mitra-red/10 text-mitra-red dark:bg-mitra-gold/10 dark:text-mitra-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          About MITRA
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Uniting & Serving the UK Telugu Community
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Mana Indian Telugu Roots Abroad (MITRA) is a non-religious community organization incorporated in the United Kingdom to preserve Telugu language, promote traditional arts, and assist international students and families.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-mitra-red/10 text-mitra-red flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            To foster a strong sense of identity, heritage, and social cohesion among Telugu-speaking families across Great Britain; to provide transparent, compassionate welfare support to students and distressed individuals; and to build meaningful cultural bridges with the wider British society.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-mitra-gold/10 text-mitra-gold flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            To be the premier cultural and community catalyst in Europe for the Telugu diaspora—recognized for excellence in arts patronage, youth mentorship, student welfare, domestic helpline support, and international partnerships.
          </p>
        </div>
      </div>

      {/* Governing Documents Downloads */}
      {/* <div id="governing-docs" className="bg-slate-100 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-mitra-red dark:text-mitra-gold" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Governing Documents & Constitution
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          MITRA operates under strict governance standards in compliance with UK charity regulations. Download our constitution and policy documents below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'MITRA Constitution (PDF)', size: '1.2 MB', ver: 'v2.1 (2024)' },
            { title: 'GDPR & Confidentiality Policy', size: '450 KB', ver: 'v1.4 (2025)' },
            { title: 'Child & Student Protection Policy', size: '820 KB', ver: 'v2.0 (2025)' }
          ].map((doc, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold text-mitra-gold uppercase">{doc.ver}</span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{doc.title}</h3>
              </div>
              <button
                onClick={() => alert(`Downloading ${doc.title}...`)}
                className="w-full bg-slate-900 hover:bg-mitra-red text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ({doc.size})</span>
              </button>
            </div>
          ))}
        </div>
      </div> */}

    </div>
  );
}
