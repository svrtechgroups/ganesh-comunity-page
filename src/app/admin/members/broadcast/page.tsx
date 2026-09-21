'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  FileText, 
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
  BookmarkPlus,
  Check,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Monitor,
  ExternalLink,
  ShieldAlert,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

export interface TemplateOption {
  id: string;
  name: string;
  badge: string;
  subject: string;
  title: string;
  badgeText: string;
  message: string;
  imageUrl?: string;
  buttonText: string;
  buttonUrl: string;
  isCustom?: boolean;
}

const BUILTIN_TEMPLATES: TemplateOption[] = [
  {
    id: 'ganesh-mahotsav',
    name: 'Ganesh Mahotsav 2026 Schedule & Seva',
    badge: 'FESTIVAL SPECIAL',
    subject: '[MITRA UK] London Ganesh Mahotsav 2026 — Schedule & Sacred Pooja Bookings',
    title: 'London Ganesh Mahotsav 2026: 7 Divine Days of Celebration',
    badgeText: 'London Ganesh Mahotsav 2026',
    imageUrl: '/assets/poster.jpg',
    message: `Dear {{name}},

We are thrilled to welcome you and your family to the London Ganesh Mahotsav 2026 at Slough & Langley College!

From 14th to 20th September 2026, experience divine daily Abhishekams, evening Aarti, Kuchipudi cultural recitals, and community Annadanam prasadam.

As a valued {{tier}} member (ID: {{id}}), you have access to personalized family Sankalpam and sanctum Darshan. Please note that daily Pooja slots are strictly limited.

May Lord Ganesha shower your family with health, happiness, and prosperity!`,
    buttonText: 'View Schedule & Book Seva',
    buttonUrl: 'https://mitra.org.uk/ganesh-event-2026',
  },
  {
    id: 'community-notice',
    name: 'Official Community Announcement',
    badge: 'GENERAL NOTICE',
    subject: '[MITRA UK] Important Community Announcement for Members',
    title: 'Official Community Notice for Registered Members',
    badgeText: 'Official Community Notice',
    imageUrl: '',
    message: `Dear {{name}},

We are writing to share an important community update with our registered members.

Please review our latest association initiatives, community welfare drives, and cultural programs planned for the coming months. Your continuous involvement as a {{tier}} member strengthens the Telugu diaspora across the United Kingdom.

Should you have any suggestions or wish to volunteer, feel free to reply directly to this notice.`,
    buttonText: 'Visit MITRA Member Portal',
    buttonUrl: 'https://mitra.org.uk/membership',
  },
  {
    id: 'membership-pass',
    name: 'Digital Membership Card & Privileges',
    badge: 'MEMBERSHIP',
    subject: '[MITRA UK] Your Digital Membership Card & Portal Access',
    title: 'Access Your Digital Membership Pass & Benefits',
    badgeText: 'Membership Privileges',
    imageUrl: '',
    message: `Dear {{name}},

Thank you for being part of the MITRA UK community!

This is a reminder that your digital membership pass is active under ID {{id}} ({{tier}}). You can present your digital QR pass at all MITRA cultural events, festival venues, and partner merchant locations for priority access.

Click below to view your digital pass and review your member benefits.`,
    buttonText: 'Access Digital Pass',
    buttonUrl: 'https://mitra.org.uk/membership',
  },
  {
    id: 'blank-custom',
    name: 'Custom Announcement (Blank Canvas)',
    badge: 'CUSTOM',
    subject: '[MITRA UK] Community Update',
    title: 'Important Update from MITRA UK',
    badgeText: 'Community Update',
    imageUrl: '',
    message: `Dear {{name}},

Type your custom announcement here. You can embed images, add external links, or use placeholders like {{name}}, {{tier}}, {{id}}, or {{email}} anywhere in your message.`,
    buttonText: '',
    buttonUrl: '',
    isCustom: true,
  },
];

const LOCAL_STORAGE_KEY = 'mitra_custom_member_templates';

interface MemberRecord {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  tier?: string;
  status?: string;
}

export default function MemberBroadcastPage() {
  const [customTemplates, setCustomTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ganesh-mahotsav');

  // Form Fields
  const [subject, setSubject] = useState(BUILTIN_TEMPLATES[0].subject);
  const [title, setTitle] = useState(BUILTIN_TEMPLATES[0].title);
  const [badgeText, setBadgeText] = useState(BUILTIN_TEMPLATES[0].badgeText);
  const [imageUrl, setImageUrl] = useState(BUILTIN_TEMPLATES[0].imageUrl || '');
  const [message, setMessage] = useState(BUILTIN_TEMPLATES[0].message);
  const [buttonText, setButtonText] = useState(BUILTIN_TEMPLATES[0].buttonText);
  const [buttonUrl, setButtonUrl] = useState(BUILTIN_TEMPLATES[0].buttonUrl);
  const [targetAudience, setTargetAudience] = useState<string>('all');

  // Preview options
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState<number>(0);

  // Members list for target count & live persona simulation
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Save template dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Send state
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStats, setSuccessStats] = useState<{
    totalRecipients: number;
    sentCount: number;
    queuedCount?: number;
    campaignId?: string;
    workerIntervalSeconds?: number;
  } | null>(null);

  // Load custom templates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomTemplates(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load custom templates:', e);
      }
    }
  }, []);

  // Fetch actual members for recipient calculation & persona testing
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      }
    } catch (e) {
      console.error('Failed to load members:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filtered members count based on targetAudience
  const targetedRecipients = useMemo(() => {
    if (!members.length) return [];
    if (targetAudience === 'active') {
      return members.filter((m) => m.status?.toLowerCase() === 'active');
    }
    if (targetAudience && targetAudience !== 'all') {
      return members.filter((m) => m.tier?.toLowerCase().includes(targetAudience.toLowerCase()));
    }
    return members;
  }, [members, targetAudience]);

  // Combined templates
  const allTemplates: TemplateOption[] = [
    ...BUILTIN_TEMPLATES,
    ...customTemplates,
  ];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = allTemplates.find((t) => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setTitle(tmpl.title);
      setBadgeText(tmpl.badgeText);
      setImageUrl(tmpl.imageUrl || '');
      setMessage(tmpl.message);
      setButtonText(tmpl.buttonText);
      setButtonUrl(tmpl.buttonUrl);
    }
  };

  const handleSaveAsCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const newTemplate: TemplateOption = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      badge: 'MY TEMPLATE',
      subject: subject.trim(),
      title: title.trim(),
      badgeText: badgeText.trim(),
      imageUrl: imageUrl.trim(),
      message: message.trim(),
      buttonText: buttonText.trim(),
      buttonUrl: buttonUrl.trim(),
      isCustom: true,
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    setSelectedTemplateId(newTemplate.id);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    setNewTemplateName('');
    setShowSaveDialog(false);
    setSaveSuccessMsg(`Template "${newTemplate.name}" saved!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (selectedTemplateId === id) {
      handleTemplateChange('ganesh-mahotsav');
    }
  };

  const insertVariable = (varName: string) => {
    setMessage((prev) => `${prev} {{${varName}}}`);
  };

  const insertImageTag = () => {
    setMessage((prev) => `${prev}\n\n![Image Description](https://example.com/image.jpg)\n`);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both Subject and Message fields.');
      return;
    }

    setSending(true);
    setError(null);
    setSuccessStats(null);

    try {
      const res = await fetch('/api/admin/members/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          message: message.trim(),
          imageUrl: imageUrl.trim() || undefined,
          badgeText: badgeText.trim(),
          buttonText: buttonText.trim() || undefined,
          buttonUrl: buttonUrl.trim() || undefined,
          targetAudience,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to dispatch emails.');
        return;
      }

      setSuccessStats(data.stats || {
        totalRecipients: targetedRecipients.length || members.length,
        sentCount: targetedRecipients.length || members.length,
        queuedCount: targetedRecipients.length || members.length,
        campaignId: data.campaignId,
      });
    } catch {
      setError('Network error. Failed to reach the notification service.');
    } finally {
      setSending(false);
    }
  };

  // Sample or real persona for preview replacement
  const activePersona = useMemo(() => {
    if (members.length > 0 && selectedPersonaIndex < members.length) {
      const m = members[selectedPersonaIndex];
      return {
        name: m.fullName || m.name || 'Suresh Kumar',
        email: m.email || 'suresh.kumar@example.com',
        tier: m.tier || 'Life Member',
        id: m.id || 'MITRA-MEM-2026-4821',
      };
    }
    return {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      tier: 'Annual Member',
      id: 'MITRA-MEM-2026-4821',
    };
  }, [members, selectedPersonaIndex]);

  // Preview message with variable replacements
  const previewMessage = useMemo(() => {
    return message
      .replace(/\{\{\s*name\s*\}\}/gi, activePersona.name)
      .replace(/\{\{\s*fullName\s*\}\}/gi, activePersona.name)
      .replace(/\{\{\s*email\s*\}\}/gi, activePersona.email)
      .replace(/\{\{\s*tier\s*\}\}/gi, activePersona.tier)
      .replace(/\{\{\s*id\s*\}\}/gi, activePersona.id)
      .replace(/\{\{\s*memberId\s*\}\}/gi, activePersona.id);
  }, [message, activePersona]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/admin/dashboard" className="hover:text-mitra-gold transition-colors">Admin</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link href="/admin/members" className="hover:text-mitra-gold transition-colors">Membership</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-mitra-gold font-bold">Broadcast Studio</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-mitra-gold rounded-2xl">
              <Mail className="w-6 h-6 text-mitra-gold" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                Notify Members Broadcast
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Live Preview Studio
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Design, test, and dispatch rich personalized announcements to all registered members with real-time email simulation.
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/members"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Members</span>
          </Link>

          <Link
            href="/admin/email-queue"
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Email Queue Worker</span>
          </Link>

          <button
            onClick={fetchMembers}
            disabled={loadingMembers}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-2 rounded-xl text-xs flex items-center gap-1 border border-slate-700 transition-colors"
            title="Refresh Member Count"
          >
            <RefreshCw className={`w-4 h-4 ${loadingMembers ? 'animate-spin text-mitra-gold' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successStats && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Broadcast Queued Successfully!</h3>
                <p className="text-xs text-emerald-300">
                  {successStats.sentCount} personalized emails queued for member dispatch via the background email worker.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/email-queue"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <span>Monitor Dispatch Queue</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSuccessStats(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Targeted Devotees</span>
              <span className="text-lg font-black text-white">{successStats.totalRecipients}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Queued Messages</span>
              <span className="text-lg font-black text-emerald-400">{successStats.sentCount}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Delivery Engine</span>
              <span className="text-xs font-bold text-amber-300">10 emails / 20s batch</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Campaign ID</span>
              <span className="text-xs font-mono text-slate-300 truncate block">{successStats.campaignId || 'camp-live'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Side Preview, Right Side Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: LIVE EMAIL PREVIEW */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          
          {/* Preview Control Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-mitra-gold" />
                <span>Live Email Preview</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Simulated in Real-Time
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Persona Switcher */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="text-[11px] text-slate-500 hidden sm:inline">Persona:</span>
                <select
                  value={selectedPersonaIndex}
                  onChange={(e) => setSelectedPersonaIndex(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-amber-300 focus:border-mitra-gold focus:outline-none max-w-[150px] truncate"
                >
                  {members.length > 0 ? (
                    members.slice(0, 15).map((m, idx) => (
                      <option key={m.id || idx} value={idx}>
                        {m.fullName || m.name} ({m.tier || 'Member'})
                      </option>
                    ))
                  ) : (
                    <option value={0}>Suresh Kumar (Sample)</option>
                  )}
                </select>
              </div>

              {/* Device Toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-mitra-gold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-mitra-gold text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile Phone Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Mobile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Frame Container */}
          <div className="flex justify-center">
            <div className={`transition-all duration-300 w-full ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-full'
            }`}>
              
              {/* Simulated Mail Client Window */}
              <div className="bg-slate-950 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Mail Client Header Bar */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[11px] font-bold text-slate-400 ml-2">
                      MITRA Dispatcher · Preview
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    HTML5 / Responsive
                  </span>
                </div>

                {/* Simulated Email Metadata Bar */}
                <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] w-14 shrink-0">From:</span>
                    <span className="text-slate-300 font-semibold truncate">
                      MITRA UK Announcements &lt;noreply@mitra.org.uk&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] w-14 shrink-0">To:</span>
                    <span className="text-amber-300 font-semibold truncate">
                      {activePersona.name} &lt;{activePersona.email}&gt;
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[11px] w-14 shrink-0">Subject:</span>
                    <span className="text-white font-bold truncate">
                      {subject || '(No subject provided)'}
                    </span>
                  </div>
                </div>

                {/* Email Body Canvas (Matches MITRA Email Branding) */}
                <div className="bg-[#F8F5F1] p-4 sm:p-7 min-h-[520px] max-h-[750px] overflow-y-auto">
                  <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8DFD5] overflow-hidden">
                    
                    {/* Branded Email Header */}
                    <div className="bg-gradient-to-r from-[#800000] via-[#A01818] to-[#800000] px-5 py-4 text-center border-b-2 border-[#D4AF37]">
                      <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#D4AF37] text-[#800000] font-black text-sm mb-1.5 shadow">
                        ॐ
                      </div>
                      <h2 className="text-sm sm:text-base font-black text-[#FFFDF8] tracking-wide font-cinzel">
                        MITRA UK TELUGU ASSOCIATION
                      </h2>
                      <p className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-semibold">
                        Registered Charity No. 1205678 · London
                      </p>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 sm:p-6 space-y-4">
                      
                      {/* Badge & Title */}
                      <div className="text-center space-y-2 border-b border-[#F3E8DF] pb-4">
                        <span className="inline-block bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                          {badgeText || 'MITRA Community Notice'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-[#3D1A00] font-cinzel leading-snug">
                          {title || subject || 'Announcement Title'}
                        </h3>
                        <p className="text-[11px] text-[#7C2D12] font-semibold">
                          Namaste, <strong className="text-[#3D1A00]">{activePersona.name}</strong>
                        </p>
                      </div>

                      {/* Featured Hero Banner Image (if provided) */}
                      {imageUrl && (
                        <div className="text-center my-3">
                          <img
                            src={imageUrl}
                            alt={title || 'Announcement'}
                            className="max-w-full max-h-64 rounded-xl mx-auto object-cover border border-[#EAD8C7] shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Formatted Message Body with Markdown Image Support */}
                      <div className="text-xs text-[#2D231E] leading-relaxed space-y-3 bg-[#FFFDF9] p-4 rounded-xl border border-[#F3E8DF]">
                        {previewMessage ? (
                          previewMessage.split('\n\n').map((paragraph, idx) => {
                            // Check if paragraph is markdown image ![alt](url)
                            const imgMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
                            if (imgMatch) {
                              return (
                                <div key={idx} className="text-center my-3">
                                  <img
                                    src={imgMatch[2]}
                                    alt={imgMatch[1]}
                                    className="max-w-full max-h-48 rounded-lg mx-auto border border-[#EAD8C7]"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              );
                            }
                            return (
                              <p key={idx} className="whitespace-pre-line m-0">
                                {paragraph}
                              </p>
                            );
                          })
                        ) : (
                          <p className="text-slate-400 italic">No message content entered yet...</p>
                        )}
                      </div>

                      {/* CTA Action Button */}
                      {buttonText && buttonUrl && (
                        <div className="text-center pt-2">
                          <a
                            href={buttonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white text-xs font-black px-6 py-2.5 rounded-full shadow-md hover:brightness-110 transition-all pointer-events-none"
                          >
                            {buttonText} →
                          </a>
                        </div>
                      )}

                      {/* Devotee Record Pill */}
                      <div className="bg-[#FFF7ED] border-l-4 border-[#EA580C] p-3 rounded-r-xl text-[11px] text-[#7C2D12] flex items-center justify-between gap-2">
                        <div>
                          <strong>Member Record:</strong> {activePersona.tier}
                        </div>
                        <div className="font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded border border-[#FDBA74]">
                          ID: {activePersona.id}
                        </div>
                      </div>

                    </div>

                    {/* Email Footer Disclaimer */}
                    <div className="bg-[#F8F5F1] border-t border-[#E8DFD5] px-5 py-4 text-center space-y-1 text-[10px] text-[#786C60]">
                      <p className="font-semibold">
                        You received this official notice as a registered member of MITRA UK.
                      </p>
                      <p>
                        MITRA UK Telugu Community · Slough &amp; London, United Kingdom · <span className="underline">mitra.org.uk</span>
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: BROADCAST OPTIONS & CONTROLS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-5">
          
          <form onSubmit={handleSendBroadcast} className="space-y-5">

            {/* CARD 1: AUDIENCE TARGETING */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-mitra-gold" />
                  <span>Target Audience &amp; Recipients</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mitra-gold/20 text-mitra-gold border border-mitra-gold/30">
                  {targetedRecipients.length} Recipient{targetedRecipients.length === 1 ? '' : 's'}
                </span>
              </div>

              <div>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:border-mitra-gold focus:outline-none"
                >
                  <option value="all">All Database Members ({members.length} total)</option>
                  <option value="active">Active Members Only ({members.filter(m => m.status?.toLowerCase() === 'active').length})</option>
                  <option value="Annual">Annual Members ({members.filter(m => m.tier?.toLowerCase().includes('annual')).length})</option>
                  <option value="Life">Life Members ({members.filter(m => m.tier?.toLowerCase().includes('life')).length})</option>
                  <option value="Patron">Patron / VIP Members ({members.filter(m => m.tier?.toLowerCase().includes('patron')).length})</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Each member receives an individualized email addressed to their name and member ID.</span>
                </p>
              </div>
            </div>

            {/* CARD 2: TEMPLATE SELECTOR */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-mitra-gold" />
                  <span>Choose Announcement Template</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(!showSaveDialog)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  <span>Save as Custom</span>
                </button>
              </div>

              {/* Save template inline form */}
              {showSaveDialog && (
                <div className="bg-slate-900 border border-mitra-gold/40 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
                  <span className="text-xs font-bold text-white block">Save current form as a custom template</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Diwali Pooja Invitation, Youth Sports..."
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAsCustomTemplate}
                      className="bg-mitra-gold hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveDialog(false)}
                      className="text-slate-400 hover:text-white px-2 py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {saveSuccessMsg && (
                <div className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Template cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {allTemplates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`p-2.5 rounded-xl text-left transition-all border text-xs flex flex-col justify-between cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-900 border-mitra-gold text-white ring-1 ring-mitra-gold shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[11px] truncate flex-1">{tmpl.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {tmpl.imageUrl && (
                            <ImageIcon className="w-3 h-3 text-amber-400" aria-label="Includes Image" />
                          )}
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                            tmpl.isCustom 
                              ? 'bg-purple-600 text-white' 
                              : isSelected 
                              ? 'bg-mitra-gold text-slate-950' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {tmpl.badge}
                          </span>
                          {tmpl.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                              className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
                              title="Delete template"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.subject}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: EMAIL HEADERS & METADATA */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
              <label className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-mitra-gold" />
                <span>Email Headers &amp; Banner Info</span>
              </label>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. [MITRA UK] London Ganesh Mahotsav 2026 Details"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* Heading & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Banner Heading
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. London Ganesh Mahotsav 2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Community Announcement"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured Banner Image */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Featured Banner Image (Optional)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageUrl('/assets/poster.jpg')}
                      className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      + Mahotsav Poster
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('/assets/favicon.ico')}
                      className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      + Logo
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL (e.g. /assets/poster.jpg or https://...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                  />
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-xl border border-red-500/20 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 4: MESSAGE CONTENT & VARIABLES */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-mitra-gold" />
                  <span>Message Body &amp; Personalization</span>
                </label>
                <button
                  type="button"
                  onClick={insertImageTag}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 transition-colors"
                  title="Insert markdown image ![Alt](url)"
                >
                  <Plus className="w-3 h-3" />
                  <span>Inline Image Tag</span>
                </button>
              </div>

              {/* Dynamic Tag Inserters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Insert tag:</span>
                {[
                  { label: '{{name}}', desc: 'Member Full Name' },
                  { label: '{{tier}}', desc: 'Membership Tier' },
                  { label: '{{id}}', desc: 'Unique Member ID' },
                  { label: '{{email}}', desc: 'Email Address' },
                ].map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => insertVariable(v.label.replace(/[{}]/g, ''))}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400/40 px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors"
                    title={v.desc}
                  >
                    +{v.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={8}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the announcement content here... You can use {{name}}, {{tier}}, {{id}} to personalize."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none font-sans leading-relaxed resize-y"
              />
            </div>

            {/* CARD 5: CALL TO ACTION (CTA) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <label className="text-xs font-bold text-mitra-gold block">
                Call to Action Button (Optional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. View Mahotsav Schedule"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Button URL
                  </label>
                  <input
                    type="url"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="e.g. https://mitra.org.uk/ganesh-event-2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-950/70 border border-red-500/50 text-red-300 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* SEND BROADCAST BAR */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-mitra-gold/30 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-mitra-gold" />
                  <span>Ready to queue broadcast</span>
                </span>
                <span className="font-bold text-white">
                  Targeting {targetedRecipients.length} member{targetedRecipients.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-mitra-gold via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-mitra-gold/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Queueing Broadcast Emails...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Send to {targetedRecipients.length} Members Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
