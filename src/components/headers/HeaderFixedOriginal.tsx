'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ShieldAlert, 
  UserCheck, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard 
} from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

const NAV_CONFIG = {
  SHOW_TOP_RIBBON: SITE_CONFIG.ENABLE_TOP_RIBBON,
  SHOW_ABOUT_DROPDOWN: SITE_CONFIG.ENABLE_ABOUT_DROPDOWN,
  SHOW_LEADERSHIP: SITE_CONFIG.ENABLE_LEADERSHIP,
  SHOW_MEMBERSHIP: SITE_CONFIG.ENABLE_MEMBERSHIP,
  SHOW_MEMBER_PORTAL: SITE_CONFIG.ENABLE_MEMBER_PORTAL,
  SHOW_LOGIN: SITE_CONFIG.ENABLE_LOGIN,
  SHOW_SEARCH: SITE_CONFIG.ENABLE_SEARCH,
};

export default function HeaderFixedOriginal({ previewMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className={`${previewMode ? 'relative w-full' : 'sticky top-0 z-50'} bg-[#FFF8F0]/96 backdrop-blur-md border-b border-[#E65C00]/20 shadow-[0_2px_20px_rgba(61,26,0,0.08)] transition-all`}>
      
      {/* Optional Top Ribbon Bar */}
      {NAV_CONFIG.SHOW_TOP_RIBBON && (
        <div className="bg-gradient-to-r from-[#E65C00] via-[#FF7A00] to-[#E65C00] text-white py-1 px-4 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="bg-white text-[#E65C00] font-black px-2 py-0.5 rounded text-[10px] uppercase">
                LONDON GANESH MAHOTSAV 2026
              </span>
              <span className="hidden md:inline text-[#FFF0DD]">
                13th – 19th September 2026 · E Block, SLOUGH &amp; LANGLEY COLLEGE
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFF0DD] transition-colors flex items-center gap-1.5 font-bold"
              >
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                <span>WhatsApp</span>
              </a>
              {NAV_CONFIG.SHOW_LOGIN && !isLoggedIn && (
                <>
                  <span className="text-white/40">|</span>
                  <Link href="/login" className="hover:text-[#FFF0DD] transition-colors flex items-center gap-1 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </Link>
                </>
              )}
              <span className="text-white/40">|</span>
              <Link href="/admin" className="hover:text-[#FFF0DD] transition-colors flex items-center gap-1 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          
          {/* Logo with strict shrink-0 protection */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/30 group-hover:ring-[#E65C00] transition-all bg-white p-1 flex items-center justify-center shadow-sm">
              <img
                src="/assets/favicon.ico"
                alt="MITRA UK Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="shrink-0 min-w-max">
              <span className="font-black text-lg sm:text-xl text-[#E65C00] font-cinzel tracking-wider block leading-none">
                MITRA UK
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-[#6B3A2A] tracking-wider uppercase block mt-1 whitespace-nowrap">
                Mana Indian Telugu Roots Abroad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Adaptive Spacing & Font */}
          <nav className="hidden xl:flex items-center space-x-2 2xl:space-x-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <Link 
              href="/" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>

            {/* About US */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdown(true)}
              onMouseLeave={() => setAboutDropdown(false)}
            >
              <button className="flex items-center gap-1 text-[#3D1A00] hover:text-[#E65C00] px-1.5 py-1">
                <span>About US</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {aboutDropdown && (
                <div className="absolute top-full left-0 w-52 bg-[#FFFAF5] shadow-xl rounded-2xl py-2 border border-[#E65C00]/20 z-50">
                  <Link href="/about" className="block px-4 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00]">MITRA UK Mission</Link>
                  <Link href="/history" className="block px-4 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00]">Guinness World Record</Link>
                </div>
              )}
            </div>

            <Link 
              href="/leadership" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/leadership') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Leadership
            </Link>

            <Link 
              href="/events" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/events') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>

            <Link 
              href="/media" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/media') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Media
            </Link>

            <Link 
              href="/sponsors" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/sponsors') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Sponsors
            </Link>

            <Link 
              href="/telugu-business" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/telugu-business') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Telugu Business
            </Link>

            <Link 
              href="/contact" 
              className={`transition-colors hover:text-[#E65C00] px-1.5 py-1 ${isCurrent('/contact') ? 'text-[#E65C00] font-black' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0">
            
            {/* Auth status */}
            {NAV_CONFIG.SHOW_LOGIN && (
              isLoggedIn ? (
                <div
                  className="relative"
                  onMouseEnter={() => setUserDropdown(true)}
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <button className="flex items-center gap-1.5 bg-[#FFF0E0] border border-[#E65C00]/30 rounded-full px-2.5 py-1.5 hover:border-[#E65C00] transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#E65C00] flex items-center justify-center overflow-hidden shrink-0">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#E65C00] max-w-[70px] truncate">
                      {user?.fullName?.split(' ')[0] || user?.username || 'User'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#6B3A2A]" />
                  </button>

                  {userDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#FFFAF5] shadow-xl rounded-2xl py-2 border border-[#E65C00]/20 z-50">
                      <div className="px-3 py-1 border-b border-[#E65C00]/15 mb-1">
                        <p className="text-[9px] text-[#6B3A2A] uppercase font-bold">Signed in</p>
                        <p className="text-xs text-[#E65C00] font-bold truncate">{user?.email}</p>
                      </div>
                      <Link href="/membership/portal" className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#3D1A00] hover:bg-[#FFF0E0]">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 w-full text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-[#E65C00] hover:underline font-bold text-xs px-2 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )
            )}

            {NAV_CONFIG.SHOW_SEARCH && (
              <Link 
                href="/search" 
                aria-label="Search Website"
                className="p-1.5 text-[#6B3A2A] hover:text-[#E65C00] transition-colors rounded-full hover:bg-[#FFF0E0]"
              >
                <Search className="w-4 h-4" />
              </Link>
            )}
            
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-3.5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform whitespace-nowrap shrink-0"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
              <span>Join WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#3D1A00] hover:text-[#E65C00]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FFFAF5] border-b border-[#E65C00]/20 px-6 pt-4 pb-8 space-y-3 font-bold text-xs uppercase animate-in slide-in-from-top duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">About US</Link>
          <Link href="/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Leadership</Link>
          <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Events</Link>
          <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Media</Link>
          <Link href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Sponsors</Link>
          <Link href="/telugu-business" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Telugu Business</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Contact</Link>
        </div>
      )}

    </header>
  );
}
