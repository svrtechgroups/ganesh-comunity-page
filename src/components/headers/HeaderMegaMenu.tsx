'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  UserCheck, 
  User, 
  Sparkles, 
  Flame, 
  Award, 
  Users, 
  Building2, 
  ImageIcon, 
  Calendar,
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

export default function HeaderMegaMenu({ previewMode = false }: HeaderProps) {
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className={`${previewMode ? 'relative w-full' : 'sticky top-0 z-50'} bg-[#FFF8F0]/98 backdrop-blur-md border-b border-[#E65C00]/20 shadow-[0_4px_20px_rgba(61,26,0,0.06)]`}>
      
      {/* Upper Micro Ribbon */}
      <div className="bg-gradient-to-r from-[#E65C00] via-[#FF7A00] to-[#E65C00] text-white py-1 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#E65C00] px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
              SAVE THE DATE
            </span>
            <span>London Ganesh Mahotsav · 13th – 19th Sept 2026</span>
          </div>
          <a
            href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline flex items-center gap-1 font-bold text-[11px]"
          >
            <span>WhatsApp Community</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo with explicit shrink protection */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/30 group-hover:ring-[#E65C00] transition-all bg-white p-1 flex items-center justify-center shadow-sm">
              <img
                src="/assets/favicon.ico"
                alt="MITRA UK Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="shrink-0 min-w-max">
              <span className="font-black text-xl sm:text-2xl text-[#E65C00] font-cinzel tracking-wider block leading-none">
                MITRA UK
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-[#6B3A2A] tracking-wider uppercase block mt-1 whitespace-nowrap">
                Mana Indian Telugu Roots Abroad
              </span>
            </div>
          </Link>

          {/* Desktop High-Priority Direct Links */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-[#E65C00] ${isCurrent('/') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>
            <Link 
              href="/events" 
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-[#E65C00] ${isCurrent('/events') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>
            <Link 
              href="/ganesh-event-2026" 
              className="px-3 py-1.5 rounded-lg text-[#E65C00] font-black flex items-center gap-1 hover:bg-[#FFF0E0] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganesh 2026</span>
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-[#E65C00] ${isCurrent('/about') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-[#E65C00] ${isCurrent('/contact') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action: Explore Drawer Button + WhatsApp */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* The "Explore Mega Menu" Button */}
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all text-xs font-bold ${
                megaOpen 
                  ? 'bg-[#E65C00] text-white border-[#E65C00] shadow-md' 
                  : 'bg-[#FFF0E0] hover:bg-[#FFE4CC] text-[#E65C00] border-[#E65C00]/30 hover:border-[#E65C00]'
              }`}
            >
              {megaOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="hidden sm:inline">Explore Directory</span>
              <span className="sm:hidden">Menu</span>
            </button>

            {/* Direct WhatsApp CTA */}
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-3.5 sm:px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-all whitespace-nowrap"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span className="hidden md:inline">Join WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* ── Rich Slide-Down Mega Overlay ── */}
      {megaOpen && (
        <div className="bg-[#FFFAF5] border-t border-[#E65C00]/20 shadow-2xl p-6 sm:p-8 animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-[#3D1A00]">
            
            {/* Column 1: Organization & Leadership */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E65C00] font-cinzel font-black text-sm tracking-wider uppercase border-b border-[#E65C00]/20 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>Our Roots &amp; Governance</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/about" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">MITRA UK Mission</div>
                      <p className="text-[11px] text-[#6B3A2A]">Empowering the Telugu diaspora across the UK</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/leadership" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Leadership &amp; Trustees</div>
                      <p className="text-[11px] text-[#6B3A2A]">Meet our dedicated committee members</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/history" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Guinness World Record</div>
                      <p className="text-[11px] text-[#6B3A2A]">Record-breaking celebration milestones</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Festivals & Culture */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E65C00] font-cinzel font-black text-sm tracking-wider uppercase border-b border-[#E65C00]/20 pb-2">
                <Flame className="w-4 h-4" />
                <span>Festivals &amp; Events</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/ganesh-event-2026" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors bg-[#FFF0E0]/60">
                    <div>
                      <div className="font-black text-[#E65C00]">London Ganesh Mahotsav 2026</div>
                      <p className="text-[11px] text-[#6B3A2A]">13th – 19th Sept 2026 · Slough Campus</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#E65C00]" />
                  </Link>
                </li>
                <li>
                  <Link href="/events" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Upcoming Cultural Events</div>
                      <p className="text-[11px] text-[#6B3A2A]">Workshops, youth galas and celebrations</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/media" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Media &amp; Photo Gallery</div>
                      <p className="text-[11px] text-[#6B3A2A]">High-resolution photo coverage &amp; videos</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Community & Directory */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E65C00] font-cinzel font-black text-sm tracking-wider uppercase border-b border-[#E65C00]/20 pb-2">
                <Building2 className="w-4 h-4" />
                <span>Community &amp; Directory</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/sponsors" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Sponsors &amp; Partners</div>
                      <p className="text-[11px] text-[#6B3A2A]">Supporting organizations and champions</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/telugu-business" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Telugu Business Directory</div>
                      <p className="text-[11px] text-[#6B3A2A]">Discover Indian-owned businesses across the UK</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/membership" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Become a Member</div>
                      <p className="text-[11px] text-[#6B3A2A]">Join our registered community membership</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={() => setMegaOpen(false)} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <div>
                      <div className="font-bold">Contact &amp; Volunteer</div>
                      <p className="text-[11px] text-[#6B3A2A]">Get involved in our community initiatives</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E65C00]/60" />
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
