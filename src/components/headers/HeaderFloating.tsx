'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  User, 
  LogOut, 
  LayoutDashboard,
  ShieldAlert,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

export default function HeaderFloating({ previewMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;
  const isMoreActive = ['/leadership', '/media', '/sponsors', '/telugu-business', '/history'].includes(pathname);

  return (
    <div className={`${previewMode ? 'relative w-full' : 'sticky top-3 z-50'} px-3 sm:px-6 max-w-7xl mx-auto transition-all`}>
      
      {/* Floating Glass Pill */}
      <header className="bg-[#FFFDF9]/92 backdrop-blur-xl border border-[#E65C00]/30 shadow-[0_12px_35px_rgba(230,92,0,0.12)] rounded-full px-4 sm:px-6 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Title with Non-Shrink Protection */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/40 group-hover:ring-[#E65C00] transition-all bg-white p-1 flex items-center justify-center shadow-inner">
              <img
                src="/assets/favicon.ico"
                alt="MITRA UK Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="shrink-0 min-w-max hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-[#E65C00] font-cinzel tracking-wider leading-none">
                  MITRA UK
                </span>
                <span className="text-[9px] bg-[#E65C00]/10 text-[#E65C00] font-black px-1.5 py-0.5 rounded-full uppercase">
                  London
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-[#6B3A2A] tracking-wider uppercase block mt-0.5 whitespace-nowrap">
                Mana Indian Telugu Roots Abroad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-full transition-all hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>

            <Link 
              href="/about" 
              className={`px-3 py-1.5 rounded-full transition-all hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/about') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              About
            </Link>

            <Link 
              href="/events" 
              className={`px-3 py-1.5 rounded-full transition-all hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/events') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>

            {/* Smart "More ▾" Overflow Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMoreDropdown(true)}
              onMouseLeave={() => setMoreDropdown(false)}
            >
              <button className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isMoreActive ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}>
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#FFFAF5] shadow-2xl rounded-2xl p-2 border border-[#E65C00]/25 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <Link href="/leadership" className="block px-3 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] rounded-xl font-bold transition-colors">
                    Leadership Team
                  </Link>
                  <Link href="/media" className="block px-3 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] rounded-xl font-bold transition-colors">
                    Media &amp; Gallery
                  </Link>
                  <Link href="/sponsors" className="block px-3 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] rounded-xl font-bold transition-colors">
                    Sponsors &amp; Partners
                  </Link>
                  <Link href="/telugu-business" className="block px-3 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] rounded-xl font-bold transition-colors">
                    Telugu Business Directory
                  </Link>
                  <Link href="/history" className="block px-3 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] rounded-xl font-bold transition-colors">
                    Guinness World Record
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/contact" 
              className={`px-3 py-1.5 rounded-full transition-all hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/contact') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            <Link 
              href="/search" 
              aria-label="Search"
              className="p-2 text-[#6B3A2A] hover:text-[#E65C00] transition-colors rounded-full hover:bg-[#FFF0E0]"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Auth status */}
            {isLoggedIn ? (
              <div 
                className="relative"
                onMouseEnter={() => setUserDropdown(true)}
                onMouseLeave={() => setUserDropdown(false)}
              >
                <button className="flex items-center gap-1.5 bg-[#FFF0E0] border border-[#E65C00]/30 rounded-full px-2.5 py-1 text-xs font-bold text-[#E65C00]">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline max-w-[70px] truncate">{user?.fullName?.split(' ')[0] || 'User'}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B3A2A]" />
                </button>
                {userDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#FFFAF5] shadow-2xl rounded-2xl py-2 border border-[#E65C00]/25 z-50">
                    <Link href="/membership/portal" className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00]">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>
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
              <Link 
                href="/login"
                className="hidden md:inline-flex text-xs font-bold text-[#E65C00] hover:underline px-2"
              >
                Login
              </Link>
            )}

            {/* Glowing WhatsApp CTA Button */}
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7569] text-white px-3.5 sm:px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span className="hidden sm:inline">Join WhatsApp</span>
              <span className="sm:hidden">Join</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#3D1A00] hover:text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-[#FFFAF5]/98 backdrop-blur-xl border border-[#E65C00]/30 rounded-3xl p-5 shadow-2xl space-y-3 text-xs font-bold uppercase animate-in slide-in-from-top-2 duration-150">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">About Us</Link>
          <Link href="/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Leadership</Link>
          <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Events</Link>
          <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Media &amp; Gallery</Link>
          <Link href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Sponsors</Link>
          <Link href="/telugu-business" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Telugu Business</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#3D1A00] hover:text-[#E65C00]">Contact</Link>
        </div>
      )}

    </div>
  );
}
