'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MapPin, Mail, Phone, Twitter, Linkedin, Facebook, Instagram, Youtube, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [department, setDepartment] = useState('General Enquiry');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, name, email, message }),
      });
      const data = await res.json();

      if (data.success) {
        trackEvent('contact_form_submitted', '/contact', { department, email });
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-mitra-red/10 text-mitra-red dark:bg-mitra-gold/10 dark:text-mitra-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Contact Mitra UK Team
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Have a query or feedback? Choose your relevant department and our committee will respond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Message Received</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your enquiry has been routed to the <strong>{department}</strong> secretary. We will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-500/50 text-rose-700 text-xs p-3 rounded-xl text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Topic
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                >
                  <option value="General Enquiry">General Info & Public Relations</option>
                  <option value="Events & Cultural Committee">Events & Cultural Festival Team</option>
                  <option value="Student & Charity Welfare">Student Counselling & Charity Welfare Officer</option>
                  <option value="Membership Desk">Membership Desk & Pass Enquiries</option>
                  <option value="Corporate Sponsorship">Corporate Sponsorship & Media Partnership</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can MITRA assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mitra-red hover:bg-mitra-red-dark text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Sending Message...' : 'Send Department Message'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Address & Verified Socials */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">MITRA Secretariat Address</h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-mitra-red shrink-0 mt-0.5" />
                <span>London ,United Kingdom</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-mitra-red shrink-0" />
                <a href="mailto:info@mitrauk.com" className="font-semibold text-mitra-red dark:text-mitra-gold">contactus@mitrauk.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-mitra-red shrink-0" />
                <span>+447436978097</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-mitra-gold shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-mitra-gold">Official Social Channels</h3>
            <p className="text-xs text-slate-300">
              All MITRA social accounts are verified and updated daily with event recordings and photo albums.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <a href="https://www.instagram.com/mitra_unitedkingdom?igsi=aDY5OHF6amFzODds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-mitra-red transition-colors">
                <Instagram className="w-4 h-4 text-sky-400" />
                <span>Instagram</span>
              </a>
              {/* <a href="https://linkedin.com/company/mitra-official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-mitra-red transition-colors">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>
              <a href="https://facebook.com/ukteluguassociation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-mitra-red transition-colors">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </a>
              <a href="https://youtube.com/@mitraofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-mitra-red transition-colors">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </a> */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
