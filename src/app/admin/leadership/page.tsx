'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Users, Plus, Trash2, Edit3, ArrowLeft, RefreshCw, X, CheckCircle, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { LeadershipMember } from '@/lib/types';

export default function AdminLeadershipPage() {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    category: 'Executive Committee',
    bio: '',
    imageUrl: '/assets/poster.jpg',
    email: '',
    phone: '',
    linkedin: '',
    twitter: '',
    displayOrder: 0,
  });

  const categories = ['Founders', 'Patrons',  'Executive Committee', 'Nari Shakthi'];

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leadership');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setUploadSuccessMsg('');
    setFormData({
      name: '',
      designation: '',
      category: 'Executive Committee',
      bio: '',
      imageUrl: '/assets/poster.jpg',
      email: '',
      phone: '',
      linkedin: '',
      twitter: '',
      displayOrder: members.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: LeadershipMember) => {
    setEditingMember(m);
    setUploadSuccessMsg('');
    setFormData({
      name: m.name,
      designation: m.designation,
      category: m.category,
      bio: m.bio || '',
      imageUrl: m.imageUrl || '/assets/poster.jpg',
      email: m.email || '',
      phone: m.phone || '',
      linkedin: m.linkedin || '',
      twitter: m.twitter || '',
      displayOrder: m.displayOrder || 0,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadSuccessMsg('');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('useCase', 'leader_profile');
      body.append('identifier', formData.name || 'leader');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setUploadSuccessMsg(`Uploaded via ${data.storageType.toUpperCase()}: ${data.filename}`);
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err: any) {
      alert(`Error uploading image: ${err?.message || 'Network error'}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingMember ? 'PUT' : 'POST';
      const payload = editingMember ? { id: editingMember.id, ...formData } : formData;

      const res = await fetch('/api/admin/leadership', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchMembers();
      } else {
        alert(data.error || 'Failed to save member.');
      }
    } catch {
      alert('Error saving leadership member.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leadership member?')) return;
    try {
      const res = await fetch(`/api/admin/leadership?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      } else {
        alert(data.error || 'Delete failed.');
      }
    } catch {
      alert('Error deleting member.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-mitra-gold" />
            <h1 className="text-2xl font-black text-white">Leadership &amp; Committee Directory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage patrons, trustees, executive committee members, and upload profile photos to FTP/Storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-mitra-red hover:bg-mitra-red-dark text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid / List */}
      {loading ? (
        <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-mitra-gold animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading leadership members from database...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No leadership members in database</p>
          <p className="text-xs text-slate-500">Click &ldquo;Add Member&rdquo; above to create your first committee entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-mitra-gold/50 bg-slate-900 shrink-0 flex items-center justify-center">
                  <img
                    src={m.imageUrl || '/assets/poster.jpg'}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="bg-mitra-red/20 text-mitra-gold border border-mitra-gold/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mb-1">
                    {m.category}
                  </span>
                  <h3 className="text-sm font-black text-white truncate">{m.name}</h3>
                  <p className="text-xs text-mitra-gold font-semibold truncate">{m.designation}</p>
                  {m.email && <p className="text-[11px] text-slate-400 font-mono truncate">{m.email}</p>}
                </div>
              </div>

              {m.bio && (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  {m.bio}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">Order: #{m.displayOrder}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-mitra-gold" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-mitra-gold relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h3 className="text-lg font-black text-mitra-gold">
                {editingMember ? 'Edit Leadership Member' : 'Add New Committee Member'}
              </h3>
              <p className="text-xs text-slate-400">
                Enter committee member details and upload photo via FTP / Storage.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Venkat S. Chary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Founder President"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload & URL Section */}
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold">Profile Photo (FTP Upload &amp; URL)</label>
                  <span className="text-[10px] text-mitra-gold font-mono">FTP Path: leaders/profiles/</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-mitra-gold/60 bg-slate-950 shrink-0 flex items-center justify-center shadow-inner">
                    <img
                      src={formData.imageUrl || '/assets/poster.jpg'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="leader-file-upload"
                    />
                    <label
                      htmlFor="leader-file-upload"
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                        uploadingImage
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-mitra-gold/15 hover:bg-mitra-gold/25 border-mitra-gold/40 text-mitra-gold'
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to FTP...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo from Device</span>
                        </>
                      )}
                    </label>

                    {uploadSuccessMsg && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{uploadSuccessMsg}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Direct Image URL / Path:</label>
                  <input
                    type="text"
                    placeholder="https://mitrauk.com/uploads/leaders/profiles/... or /assets/poster.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Short Bio / Overview</label>
                <textarea
                  rows={3}
                  placeholder="Brief biography and contribution..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="president@mitrauk.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Order (Sorting)</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Twitter / X Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-mitra-red hover:bg-mitra-red-dark text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-lg mt-2"
              >
                {editingMember ? 'Save Changes' : 'Create Leadership Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
