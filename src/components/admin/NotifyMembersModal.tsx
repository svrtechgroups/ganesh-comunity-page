'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Edit3, 
  FileText, 
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
  BookmarkPlus,
  Check
} from 'lucide-react';

interface NotifyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalMembersCount: number;
  onSuccess?: () => void;
}

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

export default function NotifyMembersModal({
  isOpen,
  onClose,
  totalMembersCount,
  onSuccess,
}: NotifyMembersModalProps) {
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
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  // Save template dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStats, setSuccessStats] = useState<{ totalRecipients: number; sentCount: number; failedCount: number } | null>(null);

  // Load custom templates from localStorage
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
        console.error('Failed to load custom templates from localStorage:', e);
      }
    }
  }, []);

  if (!isOpen) return null;

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

      setSuccessStats(data.stats);
      onSuccess?.();
    } catch {
      setError('Network error. Failed to reach the notification service.');
    } finally {
      setSending(false);
    }
  };

  // Sample devotee data for preview
  const sampleDevotee = {
    name: 'Suresh Kumar',
    email: 'suresh.kumar@example.com',
    tier: 'Annual Member',
    id: 'MITRA-MEM-2026-4821',
  };

  // Preview message with variable replacements
  let previewMessage = message
    .replace(/\{\{\s*name\s*\}\}/gi, sampleDevotee.name)
    .replace(/\{\{\s*fullName\s*\}\}/gi, sampleDevotee.name)
    .replace(/\{\{\s*email\s*\}\}/gi, sampleDevotee.email)
    .replace(/\{\{\s*tier\s*\}\}/gi, sampleDevotee.tier)
    .replace(/\{\{\s*id\s*\}\}/gi, sampleDevotee.id)
    .replace(/\{\{\s*memberId\s*\}\}/gi, sampleDevotee.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[94vh] overflow-y-auto text-slate-100">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="p-3 bg-mitra-gold/10 border border-mitra-gold/30 text-mitra-gold rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Notify Members Broadcast
              </h2>
              <span className="bg-mitra-gold/20 text-mitra-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-mitra-gold/30">
                {totalMembersCount} Total Members
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Send personalized email announcements with images and custom templates to all registered members.
            </p>
          </div>
        </div>

        {/* Success Screen */}
        {successStats ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Broadcast Dispatched Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your message has been queued and sent to members in the database.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl max-w-sm mx-auto grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Recipients</span>
                <span className="text-lg font-black text-white">{successStats.totalRecipients}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Delivered</span>
                <span className="text-lg font-black text-emerald-400">{successStats.sentCount}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setSuccessStats(null);
                  onClose();
                }}
                className="bg-mitra-gold hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            
            {/* Template Selector Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Choose or Create Template</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(!showSaveDialog)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save Current as Custom Template</span>
                  </button>
                </div>
              </div>

              {/* Save template inline form */}
              {showSaveDialog && (
                <div className="bg-slate-950 border border-mitra-gold/40 p-3 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white block">Save Current Form as a Custom Template</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Template Name (e.g., Youth Festival Notice, Charity Drive...)"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAsCustomTemplate}
                      className="bg-mitra-gold hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Save Template
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

              {/* Grid of Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {allTemplates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`p-2.5 rounded-xl text-left transition-all border text-xs flex flex-col justify-between cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-800 border-mitra-gold text-white ring-1 ring-mitra-gold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[11px] truncate flex-1">{tmpl.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
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

            {/* Tabs: Compose vs Live Preview */}
            <div className="flex items-center gap-2 border-b border-slate-800 pt-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'compose'
                    ? 'bg-mitra-gold text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Compose &amp; Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-mitra-gold text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Email Preview</span>
              </button>
            </div>

            {activeTab === 'compose' ? (
              <div className="space-y-3.5">
                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. [MITRA UK] London Ganesh Mahotsav 2026 Details"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* IMAGE SUPPORT SECTION */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Featured Banner Image (Optional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl('/assets/poster.jpg')}
                        className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        + Mahotsav Poster
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('/assets/favicon.ico')}
                        className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        + MITRA Logo
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter Image URL (e.g. /assets/poster.jpg or https://...)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-2.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-xl border border-red-500/20 transition-colors"
                        title="Remove image"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {imageUrl && (
                    <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/40 border border-slate-700 shrink-0 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        <span className="text-white font-semibold block truncate">{imageUrl}</span>
                        <span>This image will be displayed prominently at the top of the email.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Content & Helpers */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Message Content (Supports template variables &amp; inline images) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={insertImageTag}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 transition-colors"
                        title="Insert inline image markdown"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Inline Image Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Variable chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] text-slate-400">Insert tag:</span>
                    {[
                      { label: '{{name}}', desc: 'Member Name' },
                      { label: '{{tier}}', desc: 'Membership Tier' },
                      { label: '{{id}}', desc: 'Member ID' },
                      { label: '{{email}}', desc: 'Email' },
                    ].map((v) => (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => insertVariable(v.label.replace(/[{}]/g, ''))}
                        className="bg-slate-800 hover:bg-slate-700 text-mitra-gold border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
                        title={v.desc}
                      >
                        +{v.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={6}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type the message body here... You can also use ![Image Alt](https://url) for inline images."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                {/* Call-to-action button (optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Action Button Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. View Mahotsav Schedule"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Action Button URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="e.g. https://mitra.org.uk/ganesh-event-2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Target Member Group
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-mitra-gold focus:outline-none"
                  >
                    <option value="all">All Database Members ({totalMembersCount} recipients)</option>
                    <option value="active">Active Members Only</option>
                    <option value="Annual">Annual Members</option>
                    <option value="Life">Life Members</option>
                    <option value="Patron">Patron / VIP Members</option>
                  </select>
                </div>
              </div>
            ) : (
              /* LIVE PREVIEW TAB */
              <div className="bg-white text-[#2D231E] rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-inner space-y-4 max-h-[460px] overflow-y-auto">
                <div className="border-b border-[#F3E8DF] pb-3 text-center">
                  <span className="inline-block bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                    {badgeText || 'MITRA Community Notice'}
                  </span>
                  <h3 className="text-lg font-black font-cinzel text-[#3D1A00] leading-snug">
                    {title || subject}
                  </h3>
                  <p className="text-[11px] text-[#7C2D12] font-semibold mt-1">
                    Simulated Recipient: <strong>{sampleDevotee.name}</strong> ({sampleDevotee.email})
                  </p>
                </div>

                {/* Banner image preview */}
                {imageUrl && (
                  <div className="text-center my-2">
                    <img
                      src={imageUrl}
                      alt={title || 'Announcement'}
                      className="max-w-full max-h-60 rounded-xl mx-auto object-cover border border-[#EAD8C7] shadow-sm"
                    />
                  </div>
                )}

                {/* Formatted body with inline image preview */}
                <div className="text-xs text-[#2D231E] leading-relaxed space-y-2.5 bg-[#FFFDF9] p-4 rounded-xl border border-[#F3E8DF]">
                  {previewMessage.split('\n\n').map((paragraph, idx) => {
                    // Check if paragraph is markdown image ![alt](url)
                    const imgMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
                    if (imgMatch) {
                      return (
                        <div key={idx} className="text-center my-3">
                          <img
                            src={imgMatch[2]}
                            alt={imgMatch[1]}
                            className="max-w-full max-h-48 rounded-lg mx-auto border border-[#EAD8C7]"
                          />
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="whitespace-pre-line m-0">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {buttonText && buttonUrl && (
                  <div className="text-center pt-2">
                    <span className="inline-block bg-[#EA580C] text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-md">
                      {buttonText} →
                    </span>
                  </div>
                )}

                <div className="bg-[#FFF7ED] border-l-4 border-[#EA580C] p-2.5 rounded text-[11px] text-[#7C2D12]">
                  <strong>Member Record:</strong> {sampleDevotee.tier} · ID: <code className="font-mono">{sampleDevotee.id}</code>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-mitra-gold" />
                <span>Sending to all matching members in database</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-1/2 sm:w-auto bg-gradient-to-r from-mitra-gold to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to All Members</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
