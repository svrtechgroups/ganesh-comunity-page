'use client';

import { useState, useEffect } from 'react';
import { EventItem } from '@/lib/types';
import EventCard from '@/components/EventCard';
import DonationModal from '@/components/DonationModal';
import { Calendar as CalendarIcon, List, Search, Loader2 } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [statusFilter, setStatusFilter] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [selectedDonationCategory, setSelectedDonationCategory] = useState<'Annadanam' | 'Event Donations'>('Annadanam');

  useEffect(() => {
    setLoading(true);
    fetch('/api/events')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setEvents(resData.data);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load events from DB:', err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openDonation = (cat: 'Annadanam' | 'Event Donations') => {
    setSelectedDonationCategory(cat);
    setDonateModalOpen(true);
  };

  const categories = ['All', 'Cultural Events', 'Business Networking', 'Sports', 'Women Empowerment', 'World Conferences'];

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = evt.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || evt.category === categoryFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider inline-block">
          MITRA UK COMMUNITY EVENTS & FESTIVALS
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-cinzel gold-foil-text">
          EVENTS 
        </h1>
        <p className="text-xs sm:text-sm text-[#C9B79C] max-w-2xl mx-auto">
         Discover upcoming Telugu cultural, sports, music, dance, and community events across the UK.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('Upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === 'Upcoming'
                  ? 'bg-mitra-red text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setStatusFilter('Past')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === 'Past'
                  ? 'bg-mitra-navy text-mitra-gold border border-mitra-gold/30 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Past Events Archive
            </button>
          </div>

          {/* View Toggle & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search venue or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow text-mitra-red' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg text-xs font-semibold ${
                  viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow text-mitra-red' : 'text-slate-500'
                }`}
                title="Calendar Timeline View"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Output */}
      {loading ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading events from database...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No events found</h3>
          <p className="text-xs text-slate-500">Try adjusting your status or category filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        /* Calendar Timeline View */
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-mitra-red text-white text-center p-3 rounded-2xl w-20 shrink-0">
                  <span className="text-xs font-bold uppercase block">{new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                  <span className="text-2xl font-black block">{new Date(event.date).getDate()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-mitra-gold/20 text-mitra-navy px-2 py-0.5 rounded uppercase">
                    {event.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {event.time} &bull; {event.venue}
                  </p>
                </div>
              </div>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* DONATION & POOJA MODAL */}
      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        initialCategory={selectedDonationCategory}
      />
    </div>
  );
}
