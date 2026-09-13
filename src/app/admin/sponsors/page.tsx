'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  GripVertical,
  Upload,
  Eye,
  RefreshCw,
  Palette,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { SponsorItem } from '@/lib/types';

interface GradientPreset {
  name: string;
  accent: string;
  gradient: string;
  c1: string;
  c2: string;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Saffron Sun (Default)',
    accent: 'from-[#E65C00] to-[#FF7A00]',
    gradient: 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
    c1: '#E65C00',
    c2: '#FF7A00',
  },
  {
    name: 'Royal Crimson',
    accent: 'from-[#9C1F2E] to-[#7A1620]',
    gradient: 'linear-gradient(135deg, #9C1F2E 0%, #6E121C 100%)',
    c1: '#9C1F2E',
    c2: '#6E121C',
  },
  {
    name: 'Deep Cyan & Teal',
    accent: 'from-[#1A6F8D] to-[#0F4C6B]',
    gradient: 'linear-gradient(135deg, #164E63 0%, #0E3646 100%)',
    c1: '#164E63',
    c2: '#0E3646',
  },
  {
    name: 'Temple Emerald',
    accent: 'from-[#3F7A3A] to-[#2C5A2F]',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    c1: '#2E7D32',
    c2: '#1B5E20',
  },
  {
    name: 'Imperial Violet',
    accent: 'from-[#6A5B8D] to-[#4D446B]',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #311068 100%)',
    c1: '#4C1D95',
    c2: '#311068',
  },
  {
    name: 'Deep Pine',
    accent: 'from-[#4B7A6E] to-[#335E54]',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
    c1: '#0F766E',
    c2: '#115E59',
  },
  {
    name: 'Amber Gold',
    accent: 'from-[#B87F1B] to-[#8A6214]',
    gradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    c1: '#B45309',
    c2: '#78350F',
  },
  {
    name: 'Graphite Charcoal',
    accent: 'from-[#4A5568] to-[#1F2937]',
    gradient: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
    c1: '#374151',
    c2: '#1F2937',
  },
  {
    name: 'Sky Azure',
    accent: 'from-[#0EA5E9] to-[#0369A1]',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    c1: '#0284C7',
    c2: '#0369A1',
  },
  {
    name: 'Regal Orchid',
    accent: 'from-[#7C3AED] to-[#4C1D95]',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    c1: '#7C3AED',
    c2: '#5B21B6',
  },
  {
    name: 'Lime Meadow',
    accent: 'from-[#84CC16] to-[#4D7C0F]',
    gradient: 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
    c1: '#65A30D',
    c2: '#4D7C0F',
  },
  {
    name: 'Warm Mango',
    accent: 'from-[#F59E0B] to-[#B45309]',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    c1: '#D97706',
    c2: '#B45309',
  },
  {
    name: 'Spicy Tangerine',
    accent: 'from-[#F97316] to-[#C2410C]',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    c1: '#EA580C',
    c2: '#C2410C',
  },
];

const PRESET_TIERS = [
  'Brought to u by',
  'Presented By',
  'In Association With',
  'SEVA PARTNERS',
  'Platinum Partner',
  'Gold Sponsor',
  'Silver Sponsor',
  'Partner',
  'Community Supporter',
];

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    tier: string;
    logoUrl: string;
    websiteUrl: string;
    order: number;
    active: boolean;
    accent: string;
    gradient: string;
    blackLogoBg: boolean;
  }>({
    name: '',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/biryanis.png',
    websiteUrl: '',
    order: 0,
    active: true,
    accent: GRADIENT_PRESETS[0].accent,
    gradient: GRADIENT_PRESETS[0].gradient,
    blackLogoBg: false,
  });

  // Custom Color State
  const [customColor1, setCustomColor1] = useState('#E65C00');
  const [customColor2, setCustomColor2] = useState('#FF7A00');

  // Drag & Drop State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sponsors');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSponsors(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch sponsors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      tier: 'Partner',
      logoUrl: '/assets/sponsers/biryanis.png',
      websiteUrl: '',
      order: sponsors.length + 1,
      active: true,
      accent: GRADIENT_PRESETS[0].accent,
      gradient: GRADIENT_PRESETS[0].gradient,
      blackLogoBg: false,
    });
    setCustomColor1(GRADIENT_PRESETS[0].c1);
    setCustomColor2(GRADIENT_PRESETS[0].c2);
    setModalOpen(true);
  };

  const openEditModal = (sp: SponsorItem) => {
    setEditingId(sp.id);
    const accent = sp.accent || GRADIENT_PRESETS[0].accent;
    const gradient = sp.gradient || GRADIENT_PRESETS[0].gradient;
    setFormData({
      name: sp.name,
      tier: sp.tier,
      logoUrl: sp.logoUrl,
      websiteUrl: sp.websiteUrl || '',
      order: sp.order,
      active: sp.active !== false,
      accent,
      gradient,
      blackLogoBg: Boolean(sp.blackLogoBg),
    });

    // Try finding matching preset or default colors
    const matched = GRADIENT_PRESETS.find((p) => p.gradient === gradient);
    if (matched) {
      setCustomColor1(matched.c1);
      setCustomColor2(matched.c2);
    }
    setModalOpen(true);
  };

  const handlePresetSelect = (preset: GradientPreset) => {
    setFormData((prev) => ({
      ...prev,
      accent: preset.accent,
      gradient: preset.gradient,
    }));
    setCustomColor1(preset.c1);
    setCustomColor2(preset.c2);
  };

  const handleCustomColorChange = (c1: string, c2: string) => {
    setCustomColor1(c1);
    setCustomColor2(c2);
    const newGradient = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
    const newAccent = `from-[${c1}] to-[${c2}]`;
    setFormData((prev) => ({
      ...prev,
      gradient: newGradient,
      accent: newAccent,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('useCase', 'sponsor');
      uploadData.append('identifier', formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'sponsor-logo');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
        setStatusMessage('Logo uploaded successfully!');
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to upload logo.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmitSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/admin/sponsors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          fetchSponsors();
          setStatusMessage('Sponsor updated successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert(data.error || 'Failed to update sponsor');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/sponsors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          fetchSponsors();
          setStatusMessage('New sponsor added successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert(data.error || 'Failed to create sponsor');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error saving sponsor');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/sponsors?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSponsors((prev) => prev.filter((s) => s.id !== id));
        setStatusMessage('Sponsor deleted successfully');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting sponsor');
    }
  };

  // Drag & drop handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const copyList = [...sponsors];
    const draggedItemContent = copyList[dragItem.current];
    copyList.splice(dragItem.current, 1);
    copyList.splice(dragOverItem.current, 0, draggedItemContent);

    // Re-assign order based on array indices
    const updatedList = copyList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setSponsors(updatedList);
    dragItem.current = null;
    dragOverItem.current = null;

    // Persist to server
    await saveNewOrder(updatedList);
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sponsors.length) return;

    const copyList = [...sponsors];
    const temp = copyList[index];
    copyList[index] = copyList[targetIndex];
    copyList[targetIndex] = temp;

    const updatedList = copyList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setSponsors(updatedList);
    await saveNewOrder(updatedList);
  };

  const saveNewOrder = async (orderedList: SponsorItem[]) => {
    setSavingOrder(true);
    try {
      const itemsToUpdate = orderedList.map((s) => ({ id: s.id, order: s.order }));
      const res = await fetch('/api/admin/sponsors/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Placement order updated and saved to DB!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error('Failed to save order:', e);
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredSponsors = sponsors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
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
              SPONSORS &amp; PARTNERS MANAGER
            </h1>
            <span className="bg-[#E65C00] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {sponsors.length}
            </span>
          </div>
          <p className="text-xs text-[#6B3A2A] font-semibold">
            Manage Mahotsav sponsors, select accents &amp; gradients with live card preview, and drag &amp; drop to reorder placements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savingOrder && (
            <span className="text-xs font-bold text-[#E65C00] flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving order...
            </span>
          )}
          <button
            onClick={openAddModal}
            className="gold-button px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add New Sponsor</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMessage && (
        <div className="max-w-7xl mx-auto bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Instructions Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E65C00]/20 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#6B3A2A]">
          <GripVertical className="w-4 h-4 text-[#E65C00]" />
          <span className="font-bold">Tip:</span> Drag and drop rows using the grip handle or use up/down arrows to reorder how sponsors appear in the public ribbon.
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search sponsors by name or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFF8F0] border border-[#E65C00]/25 rounded-xl px-3.5 py-1.5 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
          />
        </div>
      </div>

      {/* Sponsors Drag-and-Drop List */}
      <div className="max-w-7xl mx-auto space-y-3">
        {loading ? (
          <div className="text-center py-16 text-[#6B3A2A] font-semibold text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E65C00]" />
            Loading sponsors from database...
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E65C00]/20 text-[#6B3A2A]">
            No sponsors found matching your search.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSponsors.map((sp, index) => {
              const isPdf = sp.logoUrl?.toLowerCase().endsWith('.pdf');
              const logoFrameClass = sp.blackLogoBg ? 'bg-black' : 'bg-white';

              return (
                <div
                  key={sp.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="temple-card bg-white rounded-2xl border border-[#E65C00]/20 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-move group select-none"
                >
                  {/* Left: Drag Handle, Placement #, Logo & Details */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="text-[#6B3A2A]/40 group-hover:text-[#E65C00] transition-colors cursor-grab active:cursor-grabbing p-1">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveOrder(index, 'up');
                        }}
                        disabled={index === 0}
                        className="text-[#6B3A2A]/50 hover:text-[#E65C00] disabled:opacity-20 disabled:hover:text-[#6B3A2A]/50"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 h-7 rounded-full bg-[#FFF0E0] border border-[#E65C00]/30 text-[#E65C00] font-black text-xs flex items-center justify-center">
                        #{sp.order}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveOrder(index, 'down');
                        }}
                        disabled={index === sponsors.length - 1}
                        className="text-[#6B3A2A]/50 hover:text-[#E65C00] disabled:opacity-20 disabled:hover:text-[#6B3A2A]/50"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Logo Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full border border-black/10 overflow-hidden shrink-0 p-1 flex items-center justify-center shadow-inner ${logoFrameClass}`}
                    >
                      {isPdf ? (
                        <span className="text-[8px] font-black uppercase text-center px-1">
                          {sp.name}
                        </span>
                      ) : (
                        <img
                          src={sp.logoUrl}
                          alt={sp.name}
                          className="w-full h-full object-contain rounded-full"
                        />
                      )}
                    </div>

                    {/* Name & Tier */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FFF0E0] text-[#E65C00] text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-[#E65C00]/25">
                          {sp.tier}
                        </span>
                        {!sp.active && (
                          <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#3D1A00] mt-0.5">{sp.name}</h3>
                      {sp.websiteUrl && sp.websiteUrl !== '#' && (
                        <a
                          href={sp.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#E65C00] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>{sp.websiteUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Middle: Visual Swatch of Selected Gradient */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-24 h-7 rounded-lg border border-white/40 shadow-sm flex items-center justify-center text-[10px] font-extrabold text-white px-2"
                        style={{
                          background:
                            sp.gradient ||
                            'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
                        }}
                      >
                        Preview
                      </div>
                      <span className="text-[10px] text-[#6B3A2A]/70 font-mono hidden md:inline">
                        {sp.accent || 'Default Accent'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(sp)}
                        className="p-2 rounded-xl text-[#6B3A2A] hover:text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
                        title="Edit Sponsor & Accent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sp.id, sp.name)}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete Sponsor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Sponsor Modal with Live Preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="temple-card bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/30 relative space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E65C00]/20 pb-4">
              <div>
                <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">
                  {editingId ? 'EDIT SPONSOR & ACCENT' : 'ADD NEW SPONSOR'}
                </h3>
                <p className="text-xs text-[#6B3A2A]">
                  Select accent gradient, logo background, and see real-time preview card below.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-sm font-black text-[#6B3A2A] hover:text-[#3D1A00] p-1.5"
              >
                ✕
              </button>
            </div>

            {/* LIVE PREVIEW SECTION */}
            <div className="space-y-2 bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#E65C00] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Ribbon Card Preview
                </span>
                <span className="text-[10px] text-[#6B3A2A] font-semibold">
                  (Matches public ribbon exactly)
                </span>
              </div>

              {/* The Live Public Card */}
              <div
                style={{
                  background:
                    formData.gradient ||
                    'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
                }}
                className="border border-white/30 px-5 py-4 rounded-2xl shadow-lg flex items-center gap-4 min-h-[92px] transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-full shadow-md overflow-hidden flex items-center justify-center shrink-0 p-1.5 ${
                    formData.blackLogoBg ? 'bg-black' : 'bg-white'
                  }`}
                >
                  {formData.logoUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-full rounded-full bg-[#F8FAFC] text-[#0F172A] font-black tracking-[0.18em] uppercase text-[8px] flex items-center justify-center text-center px-1 leading-tight">
                      {formData.name || 'SPONSOR'}
                    </div>
                  ) : (
                    <img
                      src={formData.logoUrl || '/assets/poster.jpg'}
                      alt={formData.name || 'Sponsor Preview'}
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/assets/sponsers/biryanis.png';
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/90 block mb-0.5 drop-shadow-sm">
                    {formData.tier || 'PARTNER'}
                  </span>
                  <span className="text-sm sm:text-base font-black font-cinzel text-white tracking-wider block truncate drop-shadow-md">
                    {formData.name || 'Sponsor Name Preview'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitSponsor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Sponsor / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. RR furnitures"
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Sponsorship Tier
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.tier}
                      onChange={(e) =>
                        setFormData({ ...formData, tier: e.target.value })
                      }
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                    >
                      {PRESET_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Logo URL & File Upload */}
              <div className="space-y-1.5">
                <label className="block text-[#6B3A2A] font-bold">
                  Logo Asset URL or File Upload
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="/assets/sponsers/rr_furnitures.png"
                    className="flex-1 bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                  <label className="gold-button px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 shrink-0 text-white">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>

              {/* Website URL & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    placeholder="https://sponsor.co.uk"
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.blackLogoBg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blackLogoBg: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#E65C00] rounded"
                    />
                    <span className="text-[#3D1A00] font-bold text-xs">
                      Black Logo Frame (Inverted)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#E65C00] rounded"
                    />
                    <span className="text-[#3D1A00] font-bold text-xs">Active</span>
                  </label>
                </div>
              </div>

              {/* GRADIENT & ACCENT SELECTOR */}
              <div className="space-y-3 pt-2 border-t border-[#E65C00]/20">
                <div className="flex items-center justify-between">
                  <label className="block text-[#6B3A2A] font-extrabold text-xs uppercase flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#E65C00]" />
                    Select Card Gradient &amp; Accent
                  </label>
                  <span className="text-[10px] text-[#6B3A2A]">
                    Click preset swatch or customize colors
                  </span>
                </div>

                {/* Preset Swatches */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((preset) => {
                    const isSelected = formData.gradient === preset.gradient;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        style={{ background: preset.gradient }}
                        className={`px-2.5 py-2 rounded-xl text-left text-white text-[10px] font-bold shadow-sm flex items-center justify-between border-2 transition-all ${
                          isSelected
                            ? 'border-white ring-2 ring-[#E65C00] scale-105'
                            : 'border-transparent hover:opacity-95'
                        }`}
                      >
                        <span className="truncate pr-1">{preset.name}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Colors Picker */}
                <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#E65C00]/25 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-[#3D1A00]">
                    Custom Gradient Colors:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-[#6B3A2A]">Color 1:</label>
                    <input
                      type="color"
                      value={customColor1}
                      onChange={(e) =>
                        handleCustomColorChange(e.target.value, customColor2)
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E65C00]/30 p-0.5 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-[#6B3A2A]">Color 2:</label>
                    <input
                      type="color"
                      value={customColor2}
                      onChange={(e) =>
                        handleCustomColorChange(customColor1, e.target.value)
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E65C00]/30 p-0.5 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-[#6B3A2A]/70 font-mono ml-auto">
                    {formData.accent}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E65C00]/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E65C00]/30 text-[#6B3A2A] hover:bg-[#FFF0E0] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow text-white"
                >
                  {editingId ? 'Update Sponsor' : 'Add Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
