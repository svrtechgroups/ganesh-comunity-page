'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth-context';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Image as ImageIcon, 
  TrendingUp, 
  LogOut, 
  UserCheck, 
  Settings,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CreditCard,
  Activity,
  Building2,
  Mail,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface AdminSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export const useAdminSidebar = () => useContext(AdminSidebarContext);

interface AdminGlobalEventContextType {
  globalEventId: string;
  setGlobalEventId: (id: string) => void;
}

export const AdminGlobalEventContext = createContext<AdminGlobalEventContextType>({
  globalEventId: 'all',
  setGlobalEventId: () => {},
});

export const useAdminGlobalEvent = () => useContext(AdminGlobalEventContext);

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [currentRole, setCurrentRole] = useState<Role>('Super Admin');
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [globalEventId, setGlobalEventIdState] = useState<string>('all');

  // Load from DB on mount
  useEffect(() => {
    fetch('/api/config/preferences?featured=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.activeHomeEventId) {
          setGlobalEventIdState(data.activeHomeEventId);
        }
      })
      .catch(console.error);
  }, []);

  const setGlobalEventId = (id: string) => {
    setGlobalEventIdState(id);
    if (id !== 'all') {
      fetch('/api/config/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setActiveHomeEvent', activeHomeEventId: id }),
      }).catch(console.error);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const roles: Role[] = [
    'Super Admin',
    'Media Secretary',
    'Events Coordinator',
    'Membership Officer',
    'Charity Officer'
  ];

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roleAccess: ['Super Admin', 'Media Secretary', 'Events Coordinator', 'Membership Officer', 'Charity Officer'] },
    { label: 'Events', href: '/admin/events', icon: Calendar, roleAccess: ['Super Admin', 'Events Coordinator'] },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, roleAccess: ['Super Admin'] },
    { label: 'Members', href: '/admin/members', icon: Users, roleAccess: ['Super Admin', 'Membership Officer'] },
    { label: 'Broadcast', href: '/admin/members/broadcast', icon: Send, roleAccess: ['Super Admin', 'Membership Officer'] },
    { label: 'Email Queue', href: '/admin/email-queue', icon: Mail, roleAccess: ['Super Admin'] },
    { label: 'Home Page', href: '/admin/event-hero', icon: Sparkles, roleAccess: ['Super Admin', 'Events Coordinator'] },
    { label: 'Media Gallery', href: '/admin/media', icon: ImageIcon, roleAccess: ['Super Admin', 'Media Secretary', 'Events Coordinator'] },
    { label: 'Featured Media', href: '/admin/featured-media', icon: Sparkles, roleAccess: ['Super Admin', 'Media Secretary', 'Events Coordinator'] },
    { label: 'Sponsors', href: '/admin/sponsors', icon: Sparkles, roleAccess: ['Super Admin', 'Events Coordinator'] },
    { label: 'Business Directory', href: '/admin/telugu-business', icon: Building2, roleAccess: ['Super Admin', 'Membership Officer', 'Events Coordinator'] },
    { label: 'Leadership', href: '/admin/leadership', icon: Users, roleAccess: ['Super Admin'] },
    { label: 'System Logs', href: '/admin/logs', icon: Activity, roleAccess: ['Super Admin'] },
    { label: 'Settings', href: '/admin/settings', icon: Settings, roleAccess: ['Super Admin'] },
  ];

  const isCurrent = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <AdminGlobalEventContext.Provider value={{ globalEventId, setGlobalEventId }}>
    <AdminSidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] flex flex-col md:flex-row font-sans admin-theme">
        
        {/* Sidebar */}
        <aside className={`bg-[#FFFDFB] border-r border-[#E65C00]/20 shadow-sm transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between ${
          sidebarOpen ? 'w-full md:w-64 p-6' : 'w-0 md:w-0 p-0 border-r-0 overflow-hidden'
        }`}>
          <div className="space-y-6">
            
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#E65C00] font-bold hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </Link>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/30 bg-white p-0.5 flex items-center justify-center shadow-sm">
                    <img
                      src="/assets/favicon.ico"
                      alt="MITRA UK Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain rounded-full block"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#3D1A00] font-cinzel leading-tight">MITRA Admin</h2>
                    <span className="text-[10px] text-[#6B3A2A] font-semibold">Portal</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B3A2A] hover:text-[#3D1A00] hover:bg-[#FFF0E0] transition-colors"
                  title="Hide Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logged-in admin user badge */}
            {user && (
              <div className="bg-[#FFF0E0] p-3 rounded-2xl border border-[#E65C00]/25 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#E65C00] block">Signed In</p>
                <p className="text-xs font-black text-[#3D1A00] truncate">{user.email}</p>
                <span className="text-[10px] bg-[#7A1620] text-white px-2.5 py-0.5 rounded-full font-bold inline-block shadow-sm">
                  {user.role}
                </span>
              </div>
            )}

            {/* Role Switcher (RBAC simulation) */}
            <div className="bg-white p-3 rounded-2xl border border-[#E65C00]/25 shadow-sm space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B3A2A] block">
                Role Preview
              </label>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                className="w-full bg-[#FFFDFB] border border-[#E65C00]/30 rounded-xl px-2.5 py-1.5 text-xs text-[#3D1A00] font-bold focus:outline-none focus:border-[#E65C00]"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1 text-xs font-semibold">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const hasAccess = item.roleAccess.includes(currentRole);
                const active = isCurrent(item.href);
                return (
                  <Link
                    key={item.href}
                    href={hasAccess ? item.href : '#'}
                    onClick={(e) => {
                      if (!hasAccess) {
                        e.preventDefault();
                        alert(`Access Restricted: Role "${currentRole}" does not have permission to manage ${item.label}.`);
                      }
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-[#E65C00] text-white font-bold shadow-md'
                        : hasAccess
                        ? 'text-[#6B3A2A] hover:bg-[#FFF0E0] hover:text-[#E65C00]'
                        : 'text-slate-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className={`w-4 h-4 ${active ? 'text-white' : 'text-[#E65C00]'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-white/80' : 'opacity-40'}`} />
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Footer info + Logout */}
          <div className="pt-6 border-t border-[#E65C00]/20 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
            </button>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative min-w-0 bg-[#FFF8F0]">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/95 border border-[#E65C00]/30 text-[#E65C00] hover:bg-[#FFF0E0] shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all hover:scale-105"
              title="Open Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Open Sidebar</span>
            </button>
          )}
          {children}
        </main>

      </div>
    </AdminSidebarContext.Provider>
    </AdminGlobalEventContext.Provider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="Admin">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthGuard>
  );
}
