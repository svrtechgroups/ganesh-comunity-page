'use client';

import Link from 'next/link';
import { MessageCircle, Heart, Instagram, Facebook, Youtube, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';

export default function Footer() {
  return (
    <footer className="bg-[#3D1A00] text-[#FFF8F0] border-t-2 border-[#E65C00]/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 space-y-12">
        
        

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-xs ">
          
          {/* Column 1: Organizers Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#E65C00]/60 overflow-hidden shrink-0 bg-white p-0.5 flex items-center justify-center">
                <img
                  src="/assets/favicon.ico"
                  alt="MITRA UK Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-black text-lg font-cinzel text-[#FF9A3C] tracking-wider">
                MITRA UK
              </span>
            </div>
            <p className="text-[#FFD4A0] leading-relaxed">
              Mana Indian Telugu Roots Abroad (MITRA UK) hosting the biggest Maha Ganapathi Mahotsav in UK.
            </p>
            <div className="flex items-center space-x-3 text-[#FF9A3C]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          

          {/* Column 3: Community Services */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#FF9A3C] uppercase tracking-wider">
              Get Involved
            </h4>
            <ul className="space-y-2 text-[#FFD4A0]">
              <li><a href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9A3C] transition-colors">Official WhatsApp Community</a></li>
              {SITE_CONFIG.ENABLE_VOLUNTEER && (
                <li><Link href="/membership" className="hover:text-[#FF9A3C] transition-colors">Volunteer Seva Registration</Link></li>
              )}
              <li><Link href="/sponsors" className="hover:text-[#FF9A3C] transition-colors">Sponsorship & Offerings</Link></li>
              {SITE_CONFIG.ENABLE_TELUGU_BUSINESS && (
                <li><Link href="/telugu-business" className="hover:text-[#FF9A3C] transition-colors">Telugu Business Directory</Link></li>
              )}
              <li><Link href="/charity" className="hover:text-[#FF9A3C] transition-colors">Student & Community Welfare</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Venue */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#FF9A3C] uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-2 text-[#FFD4A0]">
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF9A3C] shrink-0" />
                <span>contactus@mitrauk.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF9A3C] shrink-0" />
                <span>+447404530041</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & 3D Model Attribution Bar */}
        <div className="pt-8 border-t border-[#E65C00]/20 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#FFD4A0] gap-4">
          <p>© 2026 MITRA UK &amp; Mana Indian Telugu Roots Abroad (MITRA). All Rights Reserved.</p>
          <p className="text-[11px] text-[#FFD4A0]/80 text-center md:text-right">
            3D Model: &ldquo;<a href="https://sketchfab.com/3d-models/lord-ganesh-65ba76d672b6429abe999afcb4e5f6ac" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#FF9A3C] font-semibold">Lord Ganesh</a>&rdquo; by <a href="https://sketchfab.com/SandeshBhat" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#FF9A3C] font-semibold">Sandesh S Bhat</a>, licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#FF9A3C] font-semibold">CC BY 4.0</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
