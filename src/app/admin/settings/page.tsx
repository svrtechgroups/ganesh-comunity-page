'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  ArrowLeft,
  Save,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  BarChart,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<SiteSettings>({
    siteTitle: 'Mana Indian Telugu Roots Abroad (MITRA)',
    tagline: 'Serving and Connecting the Telugu Community in the United Kingdom',
    contactEmail: 'info@mitra.org.uk',
    contactPhone: '+44 20 8123 4567',
    address: 'MITRA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom',
    twitterUrl: 'https://twitter.com/mitra_official',
    linkedinUrl: 'https://linkedin.com/company/mitra-official',
    facebookUrl: 'https://facebook.com/ukteluguassociation',
    instagramUrl: 'https://instagram.com/mitra_official',
    youtubeUrl: 'https://youtube.com/@mitraofficial',
    googleAnalyticsId: 'G-MITRA2026SEO',
    enableTracking: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Site settings successfully saved to database!');
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(data.error || 'Failed to save site settings');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving settings to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-cinzel text-[#3D1A00]">
              SITE &amp; PORTAL SETTINGS
            </h1>
          </div>
          <p className="text-xs text-[#6B3A2A] font-semibold">
            Manage global site metadata, contact information, social links, and analytics tracking persisted in the database.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="gold-button px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow hover:shadow-md transition-all text-white disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className="max-w-6xl mx-auto bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="max-w-6xl mx-auto text-center py-20 text-[#6B3A2A]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[#E65C00]" />
          <p className="font-semibold text-sm">Loading settings from database...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-6">
          {/* Live Preview Card */}
          <div className="temple-card bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] p-6 rounded-3xl border-2 border-[#E65C00]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#E65C00] flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Live Brand &amp; Contact Preview
              </span>
              <span className="text-[10px] text-[#6B3A2A] bg-white px-2.5 py-1 rounded-full border border-[#E65C00]/20">
                Synchronized with DB
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black font-cinzel text-[#3D1A00]">
                {formData.siteTitle || 'Site Title'}
              </h2>
              <p className="text-xs text-[#6B3A2A] italic">
                {formData.tagline || 'Community tagline'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#6B3A2A]">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#E65C00]" />
                {formData.contactEmail}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#E65C00]" />
                {formData.contactPhone}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#E65C00]" />
                {formData.address}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: General Branding */}
            <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E65C00]/15 pb-3">
                <Globe className="w-5 h-5 text-[#E65C00]" />
                <h3 className="text-base font-black font-cinzel text-[#3D1A00]">
                  GENERAL BRANDING
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Organization / Site Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, siteTitle: e.target.value })
                    }
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Physical Address */}
            <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E65C00]/15 pb-3">
                <Mail className="w-5 h-5 text-[#E65C00]" />
                <h3 className="text-base font-black font-cinzel text-[#3D1A00]">
                  CONTACT INFORMATION
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Helpline / Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Headquarters / Centre Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Social Media Links */}
            <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E65C00]/15 pb-3">
                <Share2 className="w-5 h-5 text-[#E65C00]" />
                <h3 className="text-base font-black font-cinzel text-[#3D1A00]">
                  SOCIAL MEDIA CHANNELS
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookUrl: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, instagramUrl: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/@..."
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, twitterUrl: e.target.value })
                    }
                    placeholder="https://twitter.com/..."
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    LinkedIn Organization URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                    placeholder="https://linkedin.com/company/..."
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Analytics & Tracking */}
            <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E65C00]/15 pb-3">
                <BarChart className="w-5 h-5 text-[#E65C00]" />
                <h3 className="text-base font-black font-cinzel text-[#3D1A00]">
                  ANALYTICS &amp; SEO
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Google Analytics ID (GA4)
                  </label>
                  <input
                    type="text"
                    value={formData.googleAnalyticsId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        googleAnalyticsId: e.target.value,
                      })
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#6B3A2A]/70 mt-1">
                    Used for site traffic insights and event tracking.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E65C00]/15">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.enableTracking}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enableTracking: e.target.checked,
                        })
                      }
                      className="w-4 h-4 mt-0.5 accent-[#E65C00] rounded"
                    />
                    <div>
                      <span className="text-[#3D1A00] font-bold block">
                        Enable Audience Tracking
                      </span>
                      <span className="text-[11px] text-[#6B3A2A] block">
                        Collects anonymous telemetry for Mahotsav RSVPs and pooja registrations.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/20 flex items-center gap-3 mt-4">
                  <ShieldCheck className="w-5 h-5 text-[#E65C00] shrink-0" />
                  <p className="text-[11px] text-[#6B3A2A]">
                    All settings changes are written directly to PostgreSQL and take effect immediately across public and admin interfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="gold-button px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow hover:shadow-md transition-all text-white disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
