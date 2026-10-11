'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Sparkles, EyeOff, Eye } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'FORGOT_PASSWORD' }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black font-cinzel text-[#3D1A00]">Password Reset!</h2>
          <p className="text-[#6B3A2A] text-sm font-semibold">
            Your password has been successfully updated. Redirecting you to login...
          </p>
          <div className="w-8 h-8 border-4 border-[#E65C00] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFF0E0] via-[#FFF8F0] to-[#FFF8F0] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full temple-card p-8 rounded-3xl border-2 border-[#E65C00]/30 space-y-6 bg-white shadow-md">
        
        <div className="flex justify-between items-center border-b border-[#E65C00]/20 pb-4">
          <Link href="/login" className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
          <span className="text-[10px] font-black text-[#E65C00] uppercase tracking-wider font-cinzel">PASSWORD RECOVERY</span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black font-cinzel text-[#3D1A00]">
            Forgot Password
          </h1>
          <p className="text-xs text-[#6B3A2A] font-semibold">
            {!otpSent 
              ? 'Enter your registered email to receive a secure One-Time Password.'
              : 'Enter the OTP sent to your email along with your new password.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#6B3A2A] font-bold mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@mitrauk.com"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2 shadow"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{loading ? 'Sending OTP...' : 'Send Recovery OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#6B3A2A] font-bold mb-1">6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-center tracking-widest font-bold text-lg text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>

            <div>
              <label className="block text-[#6B3A2A] font-bold mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-10 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#6B3A2A] hover:text-[#E65C00]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#6B3A2A] font-bold mb-1">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp || !newPassword || !confirmPassword}
              className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2 shadow"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
