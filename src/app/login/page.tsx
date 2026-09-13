'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCheck, ShieldAlert, Lock, Mail, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const { login, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) {
      router.replace(redirectTo || '/membership/portal');
    }
  }, [isLoggedIn, redirectTo, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: activeTab }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
        if (activeTab === 'admin') {
          router.push('/admin');
        } else {
          router.push(redirectTo || '/membership/portal');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Devotional Background Light Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/12 via-[#FFF3E0]/60 to-[#FFF8F0] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full temple-card p-8 rounded-3xl border-2 border-[#E65C00]/30 space-y-6 shadow-[0_4px_30px_rgba(230,92,0,0.1)]">
        
        {/* Header Link */}
        <div className="flex justify-between items-center border-b border-[#E65C00]/20 pb-4">
          <Link href="/" className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Mahotsav</span>
          </Link>
          <span className="text-[10px] font-black text-[#E65C00] uppercase tracking-wider font-cinzel">MITRA PORTAL</span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#FFF0E0] p-1.5 rounded-2xl border border-[#E65C00]/20">
          <button
            type="button"
            onClick={() => { setActiveTab('member'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'member'
                ? 'bg-[#E65C00] text-white shadow-md'
                : 'text-[#6B3A2A] hover:text-[#3D1A00]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-[#E65C00] text-white shadow-md'
                : 'text-[#6B3A2A] hover:text-[#3D1A00]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin CMS</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black font-cinzel gold-foil-text">
            {activeTab === 'member' ? 'MEMBER PORTAL LOGIN' : 'ADMIN CMS LOGIN'}
          </h1>
          <p className="text-xs text-[#6B3A2A]">
            {activeTab === 'member'
              ? 'Access your digital membership card & event benefits.'
              : 'Authorized MITRA committee officers & event managers.'}
          </p>
        </div>


        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs p-3 rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6B3A2A] font-semibold mb-1">Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'member' ? 'member@mitra.org.uk' : 'admin@mitra.org.uk'}
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[#6B3A2A] font-semibold">Password</label>
              {activeTab === 'member' && (
                <Link href="/forgot-password" className="text-[10px] text-[#E65C00] hover:underline font-bold">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>{loading ? 'Authenticating...' : `Sign In to ${activeTab === 'member' ? 'Member Portal' : 'Admin CMS'}`}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E65C00]/15 text-[11px] text-[#6B3A2A] space-y-1">
          <div>
            <span>Not a member yet? </span>
            <Link href="/membership" className="text-[#E65C00] font-bold hover:underline">
              Register for Membership →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E65C00] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
