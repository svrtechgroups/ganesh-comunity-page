'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import {
  Award, ArrowLeft, LogOut, User, Mail, Phone, Heart, ShieldCheck, Camera, Loader2, CheckCircle
} from 'lucide-react';
import { useState, useRef } from 'react';

function MemberPortalContent() {
  const { user, login, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setUploadingAvatar(true);
    setUploadSuccess(false);

    try {
      // 1. Upload to FTP / Storage
      const body = new FormData();
      body.append('file', file);
      body.append('useCase', 'member_profile');
      body.append('identifier', user.fullName || user.email);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        // 2. Save image URL to Member database
        const updateRes = await fetch('/api/membership/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            imageUrl: data.url,
          }),
        });

        const updateData = await updateRes.json();
        if (updateData.success) {
          // 3. Update local auth session state
          login({
            ...user,
            imageUrl: data.url,
          });
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 4000);
        }
      } else {
        alert(data.error || 'Avatar upload failed.');
      }
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Network error'}`);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] py-12 px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Portal Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#E65C00] hover:underline mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Live Mahotsav</span>
        </Link>
        <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 text-xs font-black px-4 py-1.5 rounded-full uppercase block max-w-fit mx-auto shadow-sm">
          MY ACCOUNT
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-cinzel gold-foil-text">
          MY PROFILE
        </h1>
        <p className="text-xs text-[#6B3A2A] max-w-xl mx-auto">
          Welcome back, <strong className="text-[#E65C00]">{user?.fullName || user?.username || user?.email}</strong>.
        </p>
      </div>

      {/* Profile Card */}
      {user && (
        <div className="max-w-4xl mx-auto temple-card p-8 rounded-3xl border-2 border-[#E65C00]/30 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar with FTP Upload Picker */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-[#E65C00]/40 bg-[#FFF0E0] overflow-hidden flex items-center justify-center shadow-md">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'Member Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-[#E65C00]" />
                )}
              </div>

              {/* Upload trigger button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="member-avatar-upload"
              />
              <label
                htmlFor="member-avatar-upload"
                className="absolute bottom-0 right-0 bg-[#E65C00] text-white p-2 rounded-full cursor-pointer hover:bg-[#CC4000] shadow transition-transform hover:scale-110 flex items-center justify-center"
                title="Upload Profile Picture"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-[#6B3A2A] uppercase font-bold tracking-widest mb-0.5">Full Name</p>
                  {uploadSuccess && (
                    <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Photo updated!
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black font-cinzel text-[#3D1A00]">{user.fullName || user?.username || '—'}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E65C00]/20 text-xs">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#6B3A2A] uppercase font-bold tracking-wider mb-0.5">Email</p>
                    <p className="text-[#3D1A00] font-semibold">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-[#6B3A2A] uppercase font-bold tracking-wider mb-0.5">Phone</p>
                      <p className="text-[#3D1A00] font-semibold">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#6B3A2A] uppercase font-bold tracking-wider mb-0.5">Account ID</p>
                    <p className="text-[#3D1A00] font-mono text-[11px]">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="self-start sm:self-center py-2.5 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Signing Out…' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/events" className="temple-card p-5 rounded-2xl border border-[#E65C00]/20 hover:border-[#E65C00] transition-colors text-center space-y-2 group">
          <Award className="w-8 h-8 text-[#E65C00] mx-auto group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black text-[#E65C00] uppercase tracking-wider">Browse Events</p>
          <p className="text-[10px] text-[#6B3A2A]">Priority booking for members</p>
        </Link>
        <Link href="/charity" className="temple-card p-5 rounded-2xl border border-[#E65C00]/20 hover:border-[#E65C00] transition-colors text-center space-y-2 group">
          <ShieldCheck className="w-8 h-8 text-[#E65C00] mx-auto group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black text-[#E65C00] uppercase tracking-wider">Charity &amp; Welfare</p>
          <p className="text-[10px] text-[#6B3A2A]">Submit a help request</p>
        </Link>
        <Link href="/membership/portal/donations" className="temple-card p-5 rounded-2xl border border-[#E65C00]/20 hover:border-[#E65C00] transition-colors text-center space-y-2 group">
          <Heart className="w-8 h-8 text-[#E65C00] mx-auto group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black text-[#E65C00] uppercase tracking-wider">My Bookings &amp; Sevas</p>
          <p className="text-[10px] text-[#6B3A2A]">View your booking and seva history</p>
        </Link>
      </div>

    </div>
  );
}

export default function MemberPortalPage() {
  return (
    <AuthGuard requiredRole="Member">
      <MemberPortalContent />
    </AuthGuard>
  );
}
