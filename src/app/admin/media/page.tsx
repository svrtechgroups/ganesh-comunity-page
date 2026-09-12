'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Loader2, 
  CheckCircle, 
  X, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Eye, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Film, 
  Search,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';

interface EventOption {
  id: string;
  title: string;
  date: string;
  venue: string;
  bannerUrl: string;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category: string;
  url: string;
  coverImage?: string | null;
  description?: string | null;
  eventId?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  event?: EventOption | null;
}

interface MediaFormData {
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category: string;
  url: string;
  coverImage: string;
  description: string;
  eventId: string;
  isFeatured: boolean;
  displayOrder: number;
}

const initialFormData: MediaFormData = {
  title: '',
  type: 'IMAGE',
  category: 'Photo',
  url: '',
  coverImage: '',
  description: '',
  eventId: '',
  isFeatured: false,
  displayOrder: 0,
};

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalEventsCovered: 0,
  });

  // Filters
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag-and-Drop & Reorder State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

  // Modal & Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState<MediaFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // FTP Upload State (matching Profile Photo Upload pattern)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      if (json.success && json.data) {
        setMediaItems(json.data.mediaItems || []);
        setEvents(json.data.events || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching admin media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const openCreateModal = (defaultEventId?: string) => {
    setEditingItem(null);
    setUploadSuccessMsg('');
    setFormData({
      ...initialFormData,
      eventId: defaultEventId || (events[0]?.id || ''),
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setUploadSuccessMsg('');
    setFormData({
      title: item.title,
      type: item.type || 'IMAGE',
      category: item.category || (item.type === 'VIDEO' ? 'Video' : 'Photo'),
      url: item.url || '',
      coverImage: item.coverImage || item.url || '',
      description: item.description || '',
      eventId: item.eventId || '',
      isFeatured: Boolean(item.isFeatured),
      displayOrder: item.displayOrder || 0,
    });
    setModalOpen(true);
  };

  // FTP Upload Handler matching Add New Committee Member dialog box
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadSuccessMsg('');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('useCase', 'media_gallery');
      body.append('identifier', formData.title || 'media_asset');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          url: data.url,
          coverImage: prev.coverImage || data.url,
        }));
        setUploadSuccessMsg(`Uploaded via ${data.storageType ? data.storageType.toUpperCase() : 'FTP'}: ${data.filename}`);
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err: any) {
      alert(`Error uploading file: ${err?.message || 'Network error'}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide a title for this media item.');
      return;
    }
    if (!formData.url.trim()) {
      alert('Please upload a file or enter a direct media URL.');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const payload = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch('/api/admin/media', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchMedia();
      } else {
        alert(data.error || 'Failed to save media item.');
      }
    } catch (err: any) {
      alert(`Network error saving media: ${err?.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
      } else {
        alert(data.error || 'Failed to delete media item.');
      }
    } catch (err: any) {
      alert(`Error deleting: ${err?.message}`);
    }
  };

  // Filtered & Sorted Media
  const filteredItems = useMemo(() => {
    return mediaItems
      .filter((item) => {
        if (selectedEventFilter !== 'all') {
          if (selectedEventFilter === 'unassigned') {
            if (item.eventId) return false;
          } else if (item.eventId !== selectedEventFilter) {
            return false;
          }
        }
        if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title?.toLowerCase().includes(q);
          const matchesDesc = item.description?.toLowerCase().includes(q);
          const matchesEvent = item.event?.title?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesEvent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [mediaItems, selectedEventFilter, selectedTypeFilter, searchQuery]);

  // Batch persist reordered items to DB
  const persistOrder = async (updatedList: MediaItem[]) => {
    setIsSavingOrder(true);
    setReorderNotice('Saving updated media order...');
    try {
      const payload = updatedList.map((item, idx) => ({
        id: item.id,
        displayOrder: idx + 1,
      }));

      const res = await fetch('/api/admin/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setReorderNotice('✓ Media order updated and saved in database!');
        setTimeout(() => setReorderNotice(null), 3000);
      } else {
        setReorderNotice('Failed to save order in database.');
        setTimeout(() => setReorderNotice(null), 3000);
      }
    } catch (err) {
      console.error('Error saving reorder:', err);
      setReorderNotice('Network error saving order.');
      setTimeout(() => setReorderNotice(null), 3000);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Move front (earlier / left) or back (later / right)
  const handleMove = (filteredIdx: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? filteredIdx - 1 : filteredIdx + 1;
    if (targetIdx < 0 || targetIdx >= filteredItems.length) return;

    const newFiltered = [...filteredItems];
    const [moved] = newFiltered.splice(filteredIdx, 1);
    newFiltered.splice(targetIdx, 0, moved);

    const updatedFiltered = newFiltered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    const updatedMap = new Map(updatedFiltered.map((m) => [m.id, m]));
    const updatedAll = mediaItems.map((m) => updatedMap.get(m.id) || m);

    setMediaItems(updatedAll);
    persistOrder(updatedFiltered);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFiltered = [...filteredItems];
    const [moved] = newFiltered.splice(draggedIndex, 1);
    newFiltered.splice(dropIndex, 0, moved);

    const updatedFiltered = newFiltered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    const updatedMap = new Map(updatedFiltered.map((m) => [m.id, m]));
    const updatedAll = mediaItems.map((m) => updatedMap.get(m.id) || m);

    setMediaItems(updatedAll);
    setDraggedIndex(null);
    setDragOverIndex(null);
    persistOrder(updatedFiltered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Inline order input direct edit
  const handleInlineOrderChange = async (id: string, newOrder: number) => {
    const updatedAll = mediaItems.map((item) =>
      item.id === id ? { ...item, displayOrder: newOrder } : item
    );
    updatedAll.sort((a, b) => a.displayOrder - b.displayOrder);
    setMediaItems(updatedAll);

    try {
      await fetch('/api/admin/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id, displayOrder: newOrder }] }),
      });
      setReorderNotice(`✓ Order updated to ${newOrder}!`);
      setTimeout(() => setReorderNotice(null), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mitra-red/10 border border-mitra-gold/20 text-mitra-gold text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Media & Gallery CMS</span>
          </div>
          <h1 className="text-3xl font-black text-white">Media Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add event photos, teaser reels, and videos. Files upload directly via SiteGround FTP or link to external URLs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/media"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-colors bg-slate-900"
          >
            <Eye className="w-4 h-4 text-mitra-gold" />
            <span>View Public /media</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-mitra-red to-rose-700 hover:from-rose-600 hover:to-mitra-red text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-mitra-red/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Media</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Media</div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalMedia}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Photos &amp; Video assets</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos / Images</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalPhotos}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Gallery pictures</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            <span>Videos & Reels</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalVideos}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Teasers &amp; YouTube clips</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-mitra-gold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Events Tagged</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalEventsCovered}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Events with albums</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, caption, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
            />
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-mitra-gold" />
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
            >
              <option value="all">All Events ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.date})
                </option>
              ))}
              <option value="unassigned">General / Unassigned</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mitra-gold"
          >
            <option value="all">All Types</option>
            <option value="IMAGE">Photos Only</option>
            <option value="VIDEO">Videos Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 shrink-0">
          Showing <span className="font-bold text-white">{filteredItems.length}</span> of {mediaItems.length} items
        </div>
      </div>

      {/* Media Items Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading media library from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 border-dashed rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No media items found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No photos or videos match your filter criteria. Add media items tagged with an event to populate this gallery.
            </p>
          </div>
          <button
            onClick={() => openCreateModal(selectedEventFilter !== 'all' ? selectedEventFilter : undefined)}
            className="inline-flex items-center gap-2 bg-mitra-red hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reordering Tip Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-mitra-gold shrink-0" />
              <span>
                <strong className="text-slate-200">Reordering:</strong> Drag cards or click <strong className="text-mitra-gold">◀ / ▶</strong> to move items front or back. Click number to type order directly.
              </span>
            </div>
            {isSavingOrder && (
              <div className="flex items-center gap-1.5 text-mitra-gold text-xs font-bold animate-pulse shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to DB...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-slate-950 border rounded-3xl overflow-hidden group transition-all flex flex-col relative select-none ${
                  dragOverIndex === idx
                    ? 'border-mitra-gold ring-2 ring-mitra-gold scale-[1.02] shadow-2xl bg-mitra-gold/10'
                    : draggedIndex === idx
                    ? 'opacity-40 border-dashed border-mitra-gold'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail / Media Preview */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0 cursor-grab active:cursor-grabbing">
                  <img
                    src={item.coverImage || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || item.url || '/assets/poster.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    onError={(e) => {
                      const ytThumb = isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null;
                      if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                        (e.target as HTMLImageElement).src = ytThumb;
                      } else {
                        (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Drag Handle Indicator */}
                  <div 
                    className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white px-2 py-1 rounded-xl shadow cursor-grab active:cursor-grabbing text-[10px] font-bold transition-transform group-hover:scale-105"
                    title="Drag card to move front or back"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-mitra-gold" />
                    <span>Drag</span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow ${
                        item.type === 'VIDEO'
                          ? 'bg-amber-500/90 text-slate-950'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {item.type === 'VIDEO' ? (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo</span>
                        </>
                      )}
                    </span>

                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 bg-mitra-gold text-mitra-navy text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Video Play Overlay if video */}
                  {item.type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-mitra-red/90 text-white flex items-center justify-center shadow-xl">
                        <Film className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Event Name Overlay at bottom */}
                  <div className="absolute bottom-2 left-3 right-3 text-white pointer-events-none">
                    <span className="text-[10px] font-bold text-mitra-gold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">{item.event?.title || 'General / Unassigned'}</span>
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-mitra-gold transition-colors">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No description provided</p>
                    )}
                  </div>

                  {/* URL preview & Interactive Order Control */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="truncate max-w-[130px] font-mono text-[10px] text-slate-400" title={item.url}>
                      {item.url.startsWith('https://media.mitrauk.com') ? 'FTP: ' + item.url.split('/').pop() : item.url}
                    </span>

                    {/* Interactive Reorder Bar */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 shadow-inner shrink-0">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                        Order:
                      </label>
                      <input
                        type="number"
                        value={item.displayOrder}
                        onChange={(e) => handleInlineOrderChange(item.id, Number(e.target.value))}
                        className="w-11 bg-slate-950 text-mitra-gold font-bold text-center text-xs rounded-lg border border-slate-700 py-0.5 focus:border-mitra-gold focus:outline-none"
                        title="Type order number directly"
                      />
                      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1">
                        <button
                          type="button"
                          disabled={idx === 0 || isSavingOrder}
                          onClick={() => handleMove(idx, 'prev')}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                          title="Move Front (Earlier in gallery)"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredItems.length - 1 || isSavingOrder}
                          onClick={() => handleMove(idx, 'next')}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                          title="Move Back (Later in gallery)"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-mitra-gold" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Media Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div>
                <h2 className="text-lg font-black text-white">
                  {editingItem ? 'Edit Media Asset' : 'Add New Media Item'}
                </h2>
                <p className="text-xs text-slate-400">
                  Tag media to an event and upload via FTP or supply a direct URL.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              
              {/* Event Tagging Selection */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Tag to Event *</span>
                  <span className="text-[10px] text-mitra-gold font-normal">Shows in this event&apos;s album</span>
                </label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-mitra-gold focus:outline-none"
                >
                  <option value="">-- Select Event to Tag --</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.date}) — {evt.venue}
                    </option>
                  ))}
                  <option value="none">General / Unassigned to Specific Event</option>
                </select>
              </div>

              {/* Media Type Toggle & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Media Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'IMAGE', category: 'Photo' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold border transition-all ${
                        formData.type === 'IMAGE'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Photo / Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'VIDEO', category: 'Video' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold border transition-all ${
                        formData.type === 'VIDEO'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Clip</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Display Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                  >
                    <option value="Photo">Photo Gallery</option>
                    <option value="Video">Video Highlights</option>
                    <option value="Teaser">Teaser Reel</option>
                    <option value="Performance">Dance &amp; Music Recital</option>
                    <option value="Puja">Pooja &amp; Aarti</option>
                    <option value="MITRA Patrika">MITRA Patrika</option>
                    <option value="MITRA Souvenir">MITRA Souvenir</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Media Title / Caption *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Sthapana Aarti, 500+ Kuchipudi Recital Highlights"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* PHOTO / MEDIA ASSET (FTP Upload & URL) — Matching Add New Committee Member Dialog */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold">
                    {formData.type === 'VIDEO' ? 'Video File or YouTube URL' : 'Photo File (FTP Upload & URL)'}
                  </label>
                  <span className="text-[10px] text-mitra-gold font-mono">FTP Path: media/gallery/</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-mitra-gold/60 bg-slate-950 shrink-0 flex items-center justify-center shadow-inner relative">
                    <img
                      src={
                        formData.coverImage ||
                        (isYouTubeUrl(formData.url) ? getYouTubeThumbnailUrl(formData.url, 'hq') : null) ||
                        formData.url ||
                        '/assets/poster.jpg'
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const ytThumb = isYouTubeUrl(formData.url) ? getYouTubeThumbnailUrl(formData.url, 'hq') : null;
                        if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                          (e.target as HTMLImageElement).src = ytThumb;
                        } else {
                          (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                        }
                      }}
                    />
                    {formData.type === 'VIDEO' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <Video className="w-5 h-5 text-mitra-gold" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept={formData.type === 'VIDEO' ? 'video/*,image/*' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-file-upload"
                    />
                    <label
                      htmlFor="media-file-upload"
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                        uploadingImage
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-mitra-gold/15 hover:bg-mitra-gold/25 border-mitra-gold/40 text-mitra-gold'
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to FTP server...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File from Device (FTP)</span>
                        </>
                      )}
                    </label>

                    {uploadSuccessMsg && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{uploadSuccessMsg}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Files are uploaded to SiteGround FTP storage under <code className="text-mitra-gold">media/gallery/</code>
                    </p>
                  </div>
                </div>

                {/* Direct URL */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Direct Asset URL / YouTube / Web Link:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formData.type === 'VIDEO'
                        ? 'https://www.youtube.com/watch?v=... or https://youtu.be/... or https://media.mitrauk.com/.../video.mp4'
                        : 'https://media.mitrauk.com/media/gallery/... or /assets/organizers-poster.jpg'
                    }
                    value={formData.url}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      const isYt = isYouTubeUrl(newUrl);
                      const ytThumb = isYt ? getYouTubeThumbnailUrl(newUrl, 'hq') : null;
                      setFormData((prev) => ({
                        ...prev,
                        url: newUrl,
                        type: isYt ? 'VIDEO' : prev.type,
                        category: isYt && prev.category === 'Photo' ? 'Video' : prev.category,
                        coverImage: ytThumb || (prev.coverImage && prev.coverImage !== prev.url ? prev.coverImage : (isYt ? '' : newUrl)),
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                  />
                  {isYouTubeUrl(formData.url) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl mt-1.5">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span>YouTube video link detected! HD thumbnail auto-configured &amp; video player enabled.</span>
                    </div>
                  )}
                </div>

                {/* Custom Poster / Thumbnail for Videos */}
                {formData.type === 'VIDEO' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Video Cover / Poster Image URL (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="https://... poster thumbnail"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Description / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Additional context, guest dignitaries, dance school name..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* Sorting & Featured Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-slate-200 font-bold mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-mitra-gold focus:outline-none font-bold"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-800"
                    />
                    <span className="text-slate-200 font-bold">
                      Major Featured Cover for Event
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6 mt-0.5">
                    Will appear prominently on the /media event album card.
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-mitra-red to-rose-700 hover:from-rose-600 hover:to-mitra-red text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-mitra-red/20 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Asset...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Media Item' : 'Save Media Item'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Reorder Toast Notification */}
      {reorderNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-mitra-gold text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn backdrop-blur-md">
          {isSavingOrder ? (
            <Loader2 className="w-4 h-4 text-mitra-gold animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{reorderNotice}</span>
        </div>
      )}

    </div>
  );
}
