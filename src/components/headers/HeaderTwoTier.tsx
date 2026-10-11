'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  ShieldAlert, 
  UserCheck, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Menu, 
  X,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

export default function HeaderTwoTier({ previewMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className={`${previewMode ? 'relative w-full' : 'sticky top-0 z-50'} bg-[#FFF8F0]/98 backdrop-blur-md border-b border-[#E65C00]/20 shadow-[0_4px_25px_rgba(61,26,0,0.08)]`}>
      
      {/* ── TIER 1: Upper Utility Deck (Saffron Gradient) ── */}
      <div className="bg-gradient-to-r from-[#D44F00] via-[#E65C00] to-[#FF7A00] text-white py-1.5 px-4 sm:px-6 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          
          {/* Left: Event Highlight & Location */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-white text-[#E65C00] font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E65C00]" />
              <span>Ganesh Mahotsav 2026</span>
            </span>
            <span className="hidden md:inline text-white/90 text-[11px] truncate">
              13th – 19th Sept 2026 · Slough &amp; Langley College (SL3 8GW)
            </span>
          </div>

          {/* Right: Direct Utilities & Socials */}
          <div className="flex items-center space-x-3 shrink-0">
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
              <span>WhatsApp Community</span>
            </a>

            <span className="text-white/40">|</span>

            {isLoggedIn ? (
              <div 
                className="relative"
                onMouseEnter={() => setUserDropdown(true)}
                onMouseLeave={() => setUserDropdown(false)}
              >
                <button className="flex items-center gap-1.5 text-white hover:text-[#FFF0DD] text-[11px] font-bold">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="max-w-[80px] truncate">{user?.fullName?.split(' ')[0] || user?.username || 'Account'}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
                {userDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-[#FFFAF5] shadow-xl rounded-xl py-2 border border-[#E65C00]/20 z-50 text-[#3D1A00]">
                    <div className="px-3 py-1.5 border-b border-[#E65C00]/15 mb-1">
                      <p className="text-[10px] text-[#6B3A2A] font-bold uppercase">{user?.role || 'Member'}</p>
                      <p className="text-xs text-[#E65C00] font-black truncate">{user?.email}</p>
                    </div>
                    <Link href="/membership/portal" className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#FFF0E0] hover:text-[#E65C00]">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>
                    {user?.role === 'Admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#FFF0E0] hover:text-[#E65C00]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Admin CMS</span>
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 w-full text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hover:text-[#FFF0DD] transition-colors flex items-center gap-1 text-[11px] font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            <span className="text-white/40">|</span>

            <Link href="/admin" className="hover:text-[#FFF0DD] transition-colors flex items-center gap-1 text-[11px] font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TIER 2: Main Brand & Navigation Deck ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Un-shrinkable Brand Block */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/30 group-hover:ring-[#E65C00] transition-all bg-white p-1 flex items-center justify-center shadow-sm">
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

          {/* Desktop Navigation Links — Given Maximum Space */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-5 text-[11px] xl:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <Link 
              href="/" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>

            {/* About US Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdown(true)}
              onMouseLeave={() => setAboutDropdown(false)}
            >
              <button className={`flex items-center gap-1 px-2 py-1 hover:text-[#E65C00] transition-colors ${pathname.startsWith('/about') || pathname === '/history' ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}>
                <span>About US</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {aboutDropdown && (
                <div className="absolute top-full left-0 w-56 bg-[#FFFAF5] shadow-xl rounded-2xl py-2 border border-[#E65C00]/20 z-50">
                  <Link href="/about" className="block px-4 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">MITRA UK Mission</Link>
                  <Link href="/history" className="block px-4 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">Guinness World Record</Link>
                </div>
              )}
            </div>

            <Link 
              href="/leadership" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/leadership') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Leadership
            </Link>

            <Link 
              href="/events" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/events') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>

            <Link 
              href="/media" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/media') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Media
            </Link>

            <Link 
              href="/sponsors" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/sponsors') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Sponsors
            </Link>

            <Link 
              href="/telugu-business" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/telugu-business') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Telugu Business
            </Link>

            <Link 
              href="/contact" 
              className={`px-2 py-1 transition-colors hover:text-[#E65C00] ${isCurrent('/contact') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action: Highlighted Donate / Action Button */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0">
            <Link 
              href="/search" 
              aria-label="Search"
              className="p-2 text-[#6B3A2A] hover:text-[#E65C00] transition-colors rounded-full hover:bg-[#FFF0E0]"
            >
              <Search className="w-4 h-4" />
            </Link>
            <Link
              href="/events/evt-ganesh-chaturthi"
              className="bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white px-4 py-2 rounded-full text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganesh Utsav</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#3D1A00] hover:text-[#E65C00] hover:bg-[#FFF0E0] focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFAF5] border-t border-[#E65C00]/20 px-6 py-5 space-y-3 font-bold text-xs uppercase animate-in slide-in-from-top duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">About US</Link>
          <Link href="/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Leadership</Link>
          <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Events</Link>
          <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Media &amp; Gallery</Link>
          <Link href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Sponsors</Link>
          <Link href="/telugu-business" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Telugu Business</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Contact</Link>
        </div>
      )}

    </header>
  );
}
