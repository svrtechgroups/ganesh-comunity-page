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
  Users,
  Award,
  Sparkles,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

export default function HeaderGrouped({ previewMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [communityDropdown, setCommunityDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;
  const isAboutActive = pathname.startsWith('/about') || pathname === '/history' || pathname === '/leadership';
  const isCommunityActive = pathname === '/sponsors' || pathname === '/telugu-business' || pathname === '/media';

  return (
    <header className={`${previewMode ? 'relative w-full' : 'sticky top-0 z-50'} bg-[#FFF8F0]/96 backdrop-blur-md border-b border-[#E65C00]/20 shadow-[0_2px_20px_rgba(61,26,0,0.06)]`}>
      
      {/* Top Banner Micro Bar */}
      <div className="bg-[#E65C00] text-white py-1 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded font-black tracking-wide uppercase text-[10px]">
              London Ganesh Mahotsav 2026
            </span>
            <span className="hidden md:inline text-white/90">
              13th – 19th Sept 2026 · Slough &amp; Langley College
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-white/80 hover:text-white flex items-center gap-1 transition-colors">
              <ShieldAlert className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo with explicit shrink protection */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 max-w-[48px] max-h-[48px] sm:max-w-[56px] sm:max-h-[56px] rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/30 group-hover:ring-[#E65C00] transition-all bg-white p-1 flex items-center justify-center shadow-sm">
              <img
                src="/assets/favicon.ico"
                alt="MITRA UK Logo"
                width={56}
                height={56}
                className="w-full h-full max-w-full max-h-full object-contain rounded-full block"
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

          {/* Grouped Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            
            {/* Home */}
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg transition-colors hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>

            {/* About US Dropdown (Groups About, Leadership, Guinness, Chairman) */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdown(true)}
              onMouseLeave={() => setAboutDropdown(false)}
            >
              <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isAboutActive ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}>
                <span>About Us</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdown ? 'rotate-180 text-[#E65C00]' : ''}`} />
              </button>

              {aboutDropdown && (
                <div className="absolute top-full left-0 w-64 bg-[#FFFAF5] shadow-2xl rounded-2xl p-2 border border-[#E65C00]/20 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <Link href="/about" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <Sparkles className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">MITRA UK Mission</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">Our heritage, vision &amp; roots</div>
                    </div>
                  </Link>
                  <Link href="/leadership" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <Users className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">Leadership Team</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">Trustees, executives &amp; committee</div>
                    </div>
                  </Link>
                  <Link href="/history" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <Award className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">Guinness World Record</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">Largest laddu historic milestone</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Events */}
            <Link 
              href="/events" 
              className={`px-3 py-2 rounded-lg transition-colors hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/events') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>

            {/* Community Dropdown (Groups Sponsors, Telugu Business, Media) */}
            <div 
              className="relative"
              onMouseEnter={() => setCommunityDropdown(true)}
              onMouseLeave={() => setCommunityDropdown(false)}
            >
              <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCommunityActive ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}>
                <span>Community</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${communityDropdown ? 'rotate-180 text-[#E65C00]' : ''}`} />
              </button>

              {communityDropdown && (
                <div className="absolute top-full left-0 w-60 bg-[#FFFAF5] shadow-2xl rounded-2xl p-2 border border-[#E65C00]/20 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <Link href="/sponsors" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <Award className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">Sponsors &amp; Partners</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">Our community champions</div>
                    </div>
                  </Link>
                  <Link href="/telugu-business" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <Building2 className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">Telugu Business</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">UK diaspora business directory</div>
                    </div>
                  </Link>
                  <Link href="/media" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                    <ImageIcon className="w-4 h-4 text-[#E65C00]" />
                    <div>
                      <div className="font-bold">Media &amp; Gallery</div>
                      <div className="text-[10px] text-[#6B3A2A] normal-case">Photos, teasers &amp; coverage</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Contact */}
            <Link 
              href="/contact" 
              className={`px-3 py-2 rounded-lg transition-colors hover:text-[#E65C00] hover:bg-[#FFF0E0] ${isCurrent('/contact') ? 'text-[#E65C00] font-black bg-[#FFF0E0]' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>

          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            
            {/* Auth Pill */}
            {isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={() => setUserDropdown(true)}
                onMouseLeave={() => setUserDropdown(false)}
              >
                <button className="flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 rounded-full px-3 py-1.5 hover:border-[#E65C00] transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#E65C00] flex items-center justify-center overflow-hidden shrink-0">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#E65C00] max-w-[80px] truncate">
                    {user?.fullName?.split(' ')[0] || user?.username || 'Member'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#6B3A2A]" />
                </button>

                {userDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-[#FFFAF5] shadow-xl rounded-2xl py-2 border border-[#E65C00]/20 z-50">
                    <div className="px-4 py-2 border-b border-[#E65C00]/15 mb-1">
                      <p className="text-[10px] text-[#6B3A2A] uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="text-xs text-[#E65C00] font-black truncate">{user?.email}</p>
                    </div>
                    <Link href="/membership/portal" className="flex items-center gap-2 px-4 py-2 text-xs text-[#3D1A00] hover:bg-[#FFF0E0] hover:text-[#E65C00] transition-colors">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
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
            )}

            <Link 
              href="/search" 
              aria-label="Search Website"
              className="p-2 text-[#6B3A2A] hover:text-[#E65C00] transition-colors rounded-full hover:bg-[#FFF0E0]"
            >
              <Search className="w-4 h-4" />
            </Link>
            
            {/* WhatsApp CTA */}
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-transform whitespace-nowrap shrink-0"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span>Join WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#3D1A00] hover:text-[#E65C00] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFAF5] border-b border-[#E65C00]/20 px-6 pt-4 pb-8 space-y-4 font-bold text-xs uppercase animate-in slide-in-from-top duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Home</Link>
          <div className="py-2 border-b border-[#E65C00]/10 space-y-1">
            <div className="text-[#E65C00] text-[10px] font-black tracking-wider">ABOUT US</div>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Mission</Link>
            <Link href="/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Leadership</Link>
            <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Guinness Record</Link>
          </div>
          <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00] border-b border-[#E65C00]/10">Events</Link>
          <div className="py-2 border-b border-[#E65C00]/10 space-y-1">
            <div className="text-[#E65C00] text-[10px] font-black tracking-wider">COMMUNITY</div>
            <Link href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Sponsors</Link>
            <Link href="/telugu-business" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Telugu Business</Link>
            <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="block py-1 pl-3 text-[#3D1A00] hover:text-[#E65C00]">Media &amp; Gallery</Link>
          </div>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Contact</Link>
          <a
            href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button w-full py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 shadow-md"
          >
            <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
            <span>Join WhatsApp Community</span>
          </a>
        </div>
      )}

    </header>
  );
}
