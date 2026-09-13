'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Filter, 
  X, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Tag,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { TeluguBusiness } from '@/lib/types';

const CATEGORIES = [
  'All',
  'IT & Software Services',
  'Restaurants & Catering',
  'Real Estate & Mortgages',
  'Legal & Immigration',
  'Accounting & Tax Services',
  'Healthcare & Dental',
  'Retail & Groceries',
  'Event Management & Photography',
  'Automobile & Logistics',
  'Education & Tutoring',
  'Other Services',
];

export default function AdminTeluguBusinessPage() {
  const [businesses, setBusinesses] = useState<TeluguBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Counts
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalBusiness, setEditModalBusiness] = useState<TeluguBusiness | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: 'IT & Software Services',
    tagline: '',
    description: '',
    logoUrl: '',
    coverUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    address: '',
    city: 'London',
    postcode: '',
    status: 'Approved',
    isFeatured: false,
    specialOffer: '',
    adminNotes: '',
  });

  const fetchAdminBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/telugu-business', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBusinesses(data.data);
        if (data.counts) {
          setCounts(data.counts);
        } else {
          calculateCounts(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCounts = (list: TeluguBusiness[]) => {
    setCounts({
      total: list.length,
      pending: list.filter((b) => b.status === 'Pending').length,
      approved: list.filter((b) => b.status === 'Approved').length,
      rejected: list.filter((b) => b.status === 'Rejected').length,
    });
  };

  useEffect(() => {
    fetchAdminBusinesses();
  }, []);

  // Update Status (Approve / Reject)
  const handleStatusUpdate = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/telugu-business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        fetchAdminBusinesses();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  // Toggle Featured State
  const handleToggleFeatured = async (business: TeluguBusiness) => {
    setProcessingId(business.id);
    const updatedFeatured = !business.isFeatured;
    try {
      const res = await fetch('/api/admin/telugu-business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, isFeatured: updatedFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === business.id ? { ...b, isFeatured: updatedFeatured } : b))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Business
  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/telugu-business?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBusinesses((prev) => prev.filter((b) => b.id !== id));
        fetchAdminBusinesses();
      } else {
        alert(data.error || 'Failed to delete business');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting business');
    } finally {
      setProcessingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (b: TeluguBusiness) => {
    setEditModalBusiness(b);
    setFormData({
      businessName: b.businessName,
      ownerName: b.ownerName,
      category: b.category,
      tagline: b.tagline || '',
      description: b.description,
      logoUrl: b.logoUrl || '',
      coverUrl: b.coverUrl || '',
      email: b.email,
      phone: b.phone,
      whatsapp: b.whatsapp || '',
      website: b.website || '',
      address: b.address || '',
      city: b.city,
      postcode: b.postcode || '',
      status: b.status,
      isFeatured: b.isFeatured,
      specialOffer: b.specialOffer || '',
      adminNotes: b.adminNotes || '',
    });
  };

  // Save Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBusiness) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/telugu-business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editModalBusiness.id, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalBusiness(null);
        fetchAdminBusinesses();
      } else {
        alert(data.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving business edits');
    } finally {
      setLoading(false);
    }
  };

  // Submit New Business Added by Admin
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/telugu-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        setFormData({
          businessName: '',
          ownerName: '',
          category: 'IT & Software Services',
          tagline: '',
          description: '',
          logoUrl: '',
          coverUrl: '',
          email: '',
          phone: '',
          whatsapp: '',
          website: '',
          address: '',
          city: 'London',
          postcode: '',
          status: 'Approved',
          isFeatured: false,
          specialOffer: '',
          adminNotes: '',
        });
        fetchAdminBusinesses();
      } else {
        alert(data.error || 'Failed to add business');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding business');
    } finally {
      setLoading(false);
    }
  };

  // Filter List for display
  const filteredList = businesses.filter((b) => {
    const matchesTab = activeTab === 'All' || b.status === activeTab;
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();

    if (!q) return matchesTab && matchesCat;

    const matchesSearch =
      b.businessName.toLowerCase().includes(q) ||
      b.ownerName.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);

    return matchesTab && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-xs font-bold text-mitra-gold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/telugu-business" target="_blank" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              <span>View Public Directory</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-cinzel tracking-wide flex items-center gap-3">
            <Building2 className="w-8 h-8 text-mitra-gold" />
            <span>Telugu Business Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review business registration requests, approve community listings, feature partners, or add new Telugu businesses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminBusinesses}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setFormData({
                businessName: '',
                ownerName: '',
                category: 'IT & Software Services',
                tagline: '',
                description: '',
                logoUrl: '',
                coverUrl: '',
                email: '',
                phone: '',
                whatsapp: '',
                website: '',
                address: '',
                city: 'London',
                postcode: '',
                status: 'Approved',
                isFeatured: false,
                specialOffer: '',
                adminNotes: '',
              });
              setAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E65C00] to-[#FF7A00] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#E65C00]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Business Directly</span>
          </button>
        </div>
      </div>

      {/* ── KPI STATS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Pending Approvals Metric */}
        <div 
          onClick={() => setActiveTab('Pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'Pending'
              ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-2">
            <span>{counts.pending}</span>
            {counts.pending > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Self-registered applications</span>
        </div>

        {/* Approved Active Metric */}
        <div 
          onClick={() => setActiveTab('Approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'Approved'
              ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live &amp; Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {counts.approved}
          </div>
          <span className="text-[10px] text-slate-400">Visible on public directory</span>
        </div>

        {/* Total Directory Size */}
        <div 
          onClick={() => setActiveTab('All')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'All'
              ? 'bg-mitra-gold/10 border-mitra-gold/60 ring-2 ring-mitra-gold/30'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-mitra-gold">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Listings</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {counts.total}
          </div>
          <span className="text-[10px] text-slate-400">All registered records</span>
        </div>

        {/* Rejected Metric */}
        <div 
          onClick={() => setActiveTab('Rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'Rejected'
              ? 'bg-rose-500/10 border-rose-500/60 ring-2 ring-rose-500/30'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {counts.rejected}
          </div>
          <span className="text-[10px] text-slate-400">Declined submissions</span>
        </div>

      </div>

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => {
              const active = activeTab === tab;
              const count =
                tab === 'Pending' ? counts.pending :
                tab === 'Approved' ? counts.approved :
                tab === 'Rejected' ? counts.rejected : counts.total;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? tab === 'Pending'
                        ? 'bg-amber-500 text-slate-950 shadow font-black'
                        : tab === 'Approved'
                        ? 'bg-emerald-500 text-slate-950 shadow font-black'
                        : 'bg-mitra-gold text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab === 'Pending' ? 'Pending Review' : tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    active ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Category */}
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, owner, city, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-mitra-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-mitra-gold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* ── LIST OF BUSINESSES ── */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-950 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No businesses found</h3>
          <p className="text-xs text-slate-500">
            No entries matched the selected status tab and search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((business) => {
            const isProcessing = processingId === business.id;

            return (
              <div
                key={business.id}
                className={`bg-slate-950 border rounded-2xl p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                  business.status === 'Pending'
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : business.status === 'Rejected'
                    ? 'border-rose-500/30 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                
                {/* Left Info Column */}
                <div className="space-y-2.5 flex-1">
                  
                  {/* Category, Status & Featured Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-mitra-gold">
                      {business.category}
                    </span>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      business.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : business.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {business.status}
                    </span>

                    {business.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}

                    {business.city && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{business.city}</span>
                      </span>
                    )}
                  </div>

                  {/* Business Title & Owner */}
                  <div>
                    <h3 className="text-lg font-black text-white leading-snug flex items-center gap-2">
                      <span>{business.businessName}</span>
                      {business.website && (
                        <a
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-mitra-gold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Founder / Owner: <span className="text-white font-bold">{business.ownerName}</span>
                    </p>
                  </div>

                  {/* Tagline & Description */}
                  {business.tagline && (
                    <p className="text-xs text-mitra-gold font-semibold italic">
                      "{business.tagline}"
                    </p>
                  )}
                  <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                    {business.description}
                  </p>

                  {/* Special Offer */}
                  {business.specialOffer && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                      <Tag className="w-3.5 h-3.5" />
                      <span><strong>Offer:</strong> {business.specialOffer}</span>
                    </div>
                  )}

                  {/* Contact Info Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                    </div>
                    {business.whatsapp && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <a 
                          href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          WhatsApp Chat
                        </a>
                      </div>
                    )}
                  </div>

                  {business.adminNotes && (
                    <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <strong>Admin Notes:</strong> {business.adminNotes}
                    </div>
                  )}

                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 w-full lg:w-auto">
                  
                  {/* Approval Actions */}
                  {business.status !== 'Approved' && (
                    <button
                      onClick={() => handleStatusUpdate(business.id, 'Approved')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {business.status !== 'Rejected' && (
                    <button
                      onClick={() => handleStatusUpdate(business.id, 'Rejected')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Feature / Unfeature Button */}
                  <button
                    onClick={() => handleToggleFeatured(business)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                      business.isFeatured
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${business.isFeatured ? 'fill-current' : ''}`} />
                    <span>{business.isFeatured ? 'Featured' : 'Make Featured'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(business)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                      title="Edit Business"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteBusiness(business.id, business.businessName)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 transition-colors"
                      title="Delete Business"
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

      {/* ── MODAL: ADD / EDIT BUSINESS ── */}
      {(addModalOpen || editModalBusiness) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl my-8 text-white">
            
            <button
              onClick={() => {
                setAddModalOpen(false);
                setEditModalBusiness(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={editModalBusiness ? handleSaveEdit : handleCreateBusiness} className="space-y-5">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-mitra-gold tracking-widest">
                  {editModalBusiness ? 'Update Business Record' : 'Admin Creation'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                  {editModalBusiness ? `Edit ${editModalBusiness.businessName}` : 'Add New Telugu Business'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Founder / Owner Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    WhatsApp (Digits only)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="447700900123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Special Offer / Discount
                  </label>
                  <input
                    type="text"
                    value={formData.specialOffer}
                    onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

                {/* Status & Featured Controls */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Listing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  >
                    <option value="Approved">Approved (Live)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E65C00] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-mitra-gold">Feature on Directory Header</span>
                  </label>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    placeholder="e.g. SRA verified, Mahotsav sponsor partner"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
                  />
                </div>

              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalBusiness(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 shadow-lg"
                >
                  {editModalBusiness ? 'Save Changes' : 'Publish Business'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
